// src/controllers/analytics.controller.js
// Comprehensive analytics with proper role-scoping and rich metrics
import { prisma } from "../utils/prisma.js";
import { activeUsers, activeVisitors } from "../utils/activeUsers.js";
import { parseVisitorInfo } from "../middleware/trackVisitor.js";
import { subDays, startOfMonth, format } from "date-fns";

// ============================================================
// In-memory cache for overview stats (avoids hammering DB on 1s polling)
// Keys: "role:userId", values: { data, timestamp }
// ============================================================
const overviewCache = new Map();
const OVERVIEW_CACHE_TTL = 3000; // 3 seconds

// ============================================================
// HELPER: Get period filter date
// ============================================================
const getPeriodDate = (period) => {
  switch (period) {
    case "day": return subDays(new Date(), 1);
    case "month": return subDays(new Date(), 30);
    case "week":
    default: return subDays(new Date(), 7);
  }
};

// ============================================================
// HELPER: Get company IDs for scoped queries
// ============================================================
const getCompanyIdsForRole = async (user) => {
  if (user.role === "ENTREPRISE") return [user.id];
  if (user.role === "ADMIN") {
    const assignments = await prisma.companyAdmin.findMany({
      where: { adminId: user.id },
      select: { companyId: true },
    });
    return assignments.map((a) => a.companyId);
  }
  return null; // SUPER_ADMIN = all
};

// ============================================================
// HELPER: Get product IDs for company filter
// ============================================================
const getProductIdsForCompanies = async (companyIds) => {
  if (!companyIds) return null;
  const products = await prisma.product.findMany({
    where: { companyId: { in: companyIds } },
    select: { id: true },
  });
  return products.map((p) => p.id);
};

// ============================================================
// GET /api/analytics/most-clicked-companies
// ============================================================
export const getMostClickedCompanies = async (req, res) => {
  const { period = "week" } = req.query;
  const since = getPeriodDate(period);

  try {
    const grouped = await prisma.companyClick.groupBy({
      by: ["companyId"],
      where: { createdAt: { gte: since } },
      _count: { companyId: true },
      orderBy: { _count: { companyId: "desc" } },
      take: 10,
    });

    const result = await Promise.all(
      grouped.map(async (entry) => {
        const company = await prisma.user.findUnique({
          where: { id: entry.companyId },
          select: { fullName: true, image: true },
        });
        return {
          companyId: entry.companyId,
          companyName: company?.fullName || "Unknown",
          companyImage: company?.image || null,
          totalClicks: entry._count.companyId,
        };
      })
    );

    res.json(result);
  } catch (error) {
    console.error("Error fetching most clicked companies:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ============================================================
// GET /api/analytics/most-clicked-products
// Role-scoped: ENTREPRISE own, ADMIN assigned, SUPER_ADMIN all
// ============================================================
export const getMostClickedProducts = async (req, res) => {
  const { period = "week" } = req.query;
  const since = getPeriodDate(period);

  try {
    const user = req.user;
    const companyIds = await getCompanyIdsForRole(user);
    const productIds = await getProductIdsForCompanies(companyIds);

    const clickWhere = { createdAt: { gte: since } };
    if (productIds) clickWhere.productId = { in: productIds };

    const grouped = await prisma.productClick.groupBy({
      by: ["productId"],
      where: clickWhere,
      _count: { productId: true },
      orderBy: { _count: { productId: "desc" } },
      take: 10,
    });

    const now = new Date();
    const result = await Promise.all(
      grouped.map(async (entry) => {
        const product = await prisma.product.findFirst({
          where: {
            id: entry.productId,
            OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
          },
          include: { company: { select: { fullName: true } } },
        });

        if (!product) return null;

        return {
          productId: entry.productId,
          productName: product.name,
          name: product.name,
          companyName: product.company?.fullName || "Unknown",
          totalClicks: entry._count.productId,
          clicks: entry._count.productId,
        };
      })
    );

    res.json(result.filter(Boolean));
  } catch (error) {
    console.error("Error fetching most clicked products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ============================================================
// GET /api/analytics/city-stats/monthly
// ============================================================
export const getMonthlyCityStats = async (req, res) => {
  try {
    const since = startOfMonth(new Date());
    const stats = await prisma.userActivity.groupBy({
      by: ["city"],
      where: {
        createdAt: { gte: since },
        city: { not: null },
      },
      _count: { city: true },
      orderBy: { _count: { city: "desc" } },
    });

    res.json(
      stats.map((s) => ({
        city: s.city || "Unknown",
        count: s._count.city,
      }))
    );
  } catch (err) {
    console.error("Error fetching city stats:", err);
    res.status(500).json({ error: "Failed to fetch monthly city stats" });
  }
};

// ============================================================
// GET /api/analytics/devices/monthly
// ============================================================
export const getMonthlyDeviceStats = async (req, res) => {
  try {
    const since = startOfMonth(new Date());
    const grouped = await prisma.userActivity.groupBy({
      by: ["deviceType"],
      where: {
        createdAt: { gte: since },
        deviceType: { not: null },
      },
      _count: { deviceType: true },
      orderBy: { _count: { deviceType: "desc" } },
    });

    res.json(
      grouped.map((g) => ({
        device: g.deviceType || "Unknown",
        count: g._count.deviceType,
      }))
    );
  } catch (err) {
    console.error("Error fetching monthly device stats:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ============================================================
// GET /api/analytics/promotion-performance
// Clicks per day for last N days, role-scoped
// ============================================================
export const getPromotionPerformance = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const user = req.user;
    const numDays = parseInt(days);
    const since = subDays(new Date(), numDays);

    const companyIds = await getCompanyIdsForRole(user);
    const productIds = await getProductIdsForCompanies(companyIds);

    const clickWhere = { createdAt: { gte: since } };
    if (productIds) clickWhere.productId = { in: productIds };

    const clicks = await prisma.productClick.findMany({
      where: clickWhere,
      select: { createdAt: true },
    });

    const dailyMap = {};
    for (let i = 0; i < numDays; i++) {
      const key = format(subDays(new Date(), i), "yyyy-MM-dd");
      dailyMap[key] = 0;
    }
    for (const click of clicks) {
      const key = format(click.createdAt, "yyyy-MM-dd");
      if (dailyMap[key] !== undefined) dailyMap[key]++;
    }

    const result = Object.entries(dailyMap)
      .map(([date, clicks]) => ({ date, clicks }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.json(result);
  } catch (err) {
    console.error("Error fetching promotion performance:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ============================================================
// GET /api/analytics/company-city-stats
// ============================================================
export const getCompanyCityStats = async (req, res) => {
  try {
    const since = startOfMonth(new Date());

    const stats = await prisma.userActivity.groupBy({
      by: ["city"],
      where: {
        createdAt: { gte: since },
        city: { not: null },
      },
      _count: { city: true },
      orderBy: { _count: { city: "desc" } },
      take: 10,
    });

    res.json(
      stats.map((s) => ({
        city: s.city || "Unknown",
        count: s._count.city,
      }))
    );
  } catch (err) {
    console.error("Error fetching company city stats:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ============================================================
// GET /api/analytics/company-device-stats
// ============================================================
export const getCompanyDeviceStats = async (req, res) => {
  try {
    const since = startOfMonth(new Date());

    const grouped = await prisma.userActivity.groupBy({
      by: ["deviceType"],
      where: {
        createdAt: { gte: since },
        deviceType: { not: null },
      },
      _count: { deviceType: true },
      orderBy: { _count: { deviceType: "desc" } },
    });

    res.json(
      grouped.map((g) => ({
        device: g.deviceType || "Unknown",
        count: g._count.deviceType,
      }))
    );
  } catch (err) {
    console.error("Error fetching company device stats:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ============================================================
// GET /api/analytics/overview-stats
// Rich stats scoped by role
// ============================================================
export const getOverviewStats = async (req, res) => {
  try {
    const user = req.user;
    const cacheKey = `${user.role}:${user.id}`;
    const cached = overviewCache.get(cacheKey);
    const now = Date.now();

    let stats;

    // Use cached DB data if fresh (< 3s old), else re-query
    if (cached && now - cached.timestamp < OVERVIEW_CACHE_TTL) {
      stats = { ...cached.data };
    } else {
      // Re-fetch from DB
      if (user.role === "SUPER_ADMIN") {
        const nowDate = new Date();
        const todayStart = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate());
        const monthStartDate = startOfMonth(nowDate);

        const [
          totalUsers, admins, companies, superAdmins,
          totalProducts, activeProducts,
          totalProductClicks, totalCompanyClicks,
          totalVisits, todayVisits, monthlyVisits,
        ] = await Promise.all([
          prisma.user.count({ where: { role: "USER", isDeleted: false } }),
          prisma.user.count({ where: { role: "ADMIN", isDeleted: false } }),
          prisma.user.count({ where: { role: "ENTREPRISE", isDeleted: false } }),
          prisma.user.count({ where: { role: "SUPER_ADMIN" } }),
          prisma.product.count(),
          prisma.product.count({ where: { status: "ACTIVE" } }),
          prisma.productClick.count(),
          prisma.companyClick.count(),
          prisma.userActivity.count(),
          prisma.userActivity.count({ where: { createdAt: { gte: todayStart } } }),
          prisma.userActivity.count({ where: { createdAt: { gte: monthStartDate } } }),
        ]);

        stats = {
          totalUsers, admins, companies, superAdmins,
          totalProducts, activeProducts,
          totalProductClicks, totalCompanyClicks,
          totalClicks: totalProductClicks + totalCompanyClicks,
          totalVisits, todayVisits, monthlyVisits,
        };
      } else if (user.role === "ADMIN") {
        const assignments = await prisma.companyAdmin.findMany({
          where: { adminId: user.id },
          select: { companyId: true },
        });
        const companyIds = assignments.map((a) => a.companyId);

        const [assignedCompanies, totalProducts, activeProducts, expiredProducts, deletedProducts, totalClicks] = await Promise.all([
          Promise.resolve(companyIds.length),
          prisma.product.count({ where: { companyId: { in: companyIds } } }),
          prisma.product.count({ where: { companyId: { in: companyIds }, status: "ACTIVE" } }),
          prisma.product.count({ where: { companyId: { in: companyIds }, status: "EXPIRED" } }),
          prisma.product.count({ where: { companyId: { in: companyIds }, status: "DELETED" } }),
          prisma.productClick.count({
            where: { product: { companyId: { in: companyIds } } },
          }),
        ]);

        stats = { assignedCompanies, totalProducts, activeProducts, expiredProducts, deletedProducts, totalClicks };
      } else if (user.role === "ENTREPRISE") {
        const [totalProducts, activeProducts, expiredProducts, deletedProducts, followers, companyClicks, productClicks] = await Promise.all([
          prisma.product.count({ where: { companyId: user.id } }),
          prisma.product.count({ where: { companyId: user.id, status: "ACTIVE" } }),
          prisma.product.count({ where: { companyId: user.id, status: "EXPIRED" } }),
          prisma.product.count({ where: { companyId: user.id, status: "DELETED" } }),
          prisma.companyFollow.count({ where: { companyId: user.id } }),
          prisma.companyClick.count({ where: { companyId: user.id } }),
          prisma.productClick.count({ where: { product: { companyId: user.id } } }),
        ]);

        stats = {
          totalProducts, activeProducts, expiredProducts, deletedProducts,
          followers,
          totalClicks: companyClicks + productClicks,
          companyClicks, productClicks,
        };
      }

      // Store in cache
      overviewCache.set(cacheKey, { data: stats, timestamp: now });
    }

    // Always compute onlineUsers fresh from in-memory map (instant, no DB)
    if (user.role === "SUPER_ADMIN") {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
      let onlineUsers = 0;
      for (const [ip, data] of activeVisitors) {
        if (data.lastSeen >= fiveMinAgo) {
          onlineUsers++;
        } else {
          activeVisitors.delete(ip);
        }
      }
      stats.onlineUsers = onlineUsers;
    }

    res.json(stats);
  } catch (err) {
    console.error("Error fetching overview stats:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ============================================================
// GET /api/analytics/visitor-stats
// ============================================================
export const getVisitorStats = async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = subDays(now, 7);
    const monthStart = startOfMonth(now);

    const [totalVisits, todayVisits, weeklyVisits, monthlyVisits, guestVisits, userVisits] = await Promise.all([
      prisma.userActivity.count(),
      prisma.userActivity.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.userActivity.count({ where: { createdAt: { gte: weekStart } } }),
      prisma.userActivity.count({ where: { createdAt: { gte: monthStart } } }),
      prisma.userActivity.count({ where: { userId: null } }),
      prisma.userActivity.count({ where: { userId: { not: null } } }),
    ]);

    const uniqueIps = await prisma.userActivity.groupBy({
      by: ["ipAddress"],
      where: {
        createdAt: { gte: monthStart },
        ipAddress: { not: null },
      },
    });

    res.json({
      totalVisits, todayVisits, weeklyVisits, monthlyVisits,
      guestVisits, userVisits,
      uniqueVisitorsThisMonth: uniqueIps.length,
    });
  } catch (err) {
    console.error("Error fetching visitor stats:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ============================================================
// GET /api/analytics/browser-stats
// ============================================================
export const getBrowserStats = async (req, res) => {
  try {
    const since = startOfMonth(new Date());

    const grouped = await prisma.userActivity.groupBy({
      by: ["browser"],
      where: {
        createdAt: { gte: since },
        browser: { not: null },
      },
      _count: { browser: true },
      orderBy: { _count: { browser: "desc" } },
      take: 10,
    });

    res.json(
      grouped
        .filter((g) => g.browser && g.browser !== "unknown")
        .map((g) => ({
          browser: g.browser,
          count: g._count.browser,
        }))
    );
  } catch (err) {
    console.error("Error fetching browser stats:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ============================================================
// GET /api/analytics/os-stats
// ============================================================
export const getOsStats = async (req, res) => {
  try {
    const since = startOfMonth(new Date());

    const grouped = await prisma.userActivity.groupBy({
      by: ["os"],
      where: {
        createdAt: { gte: since },
        os: { not: null },
      },
      _count: { os: true },
      orderBy: { _count: { os: "desc" } },
      take: 10,
    });

    res.json(
      grouped
        .filter((g) => g.os && g.os !== "unknown")
        .map((g) => ({
          os: g.os,
          count: g._count.os,
        }))
    );
  } catch (err) {
    console.error("Error fetching OS stats:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ============================================================
// POST /api/analytics/track-visit (PUBLIC)
// Throttled: max 1 record per IP per 30 minutes
// ============================================================
const guestThrottle = new Map();
const GUEST_THROTTLE_MS = 30 * 60 * 1000;

export const trackPublicVisit = async (req, res) => {
  try {
    const visitorInfo = parseVisitorInfo(req);

    console.log("[trackPublicVisit] Guest visit from IP:", visitorInfo.ipAddress, "| Device:", visitorInfo.deviceType, "| OS:", visitorInfo.os, "| Browser:", visitorInfo.browser, "| City:", visitorInfo.city);

    // Update in-memory active visitors map for online count (always)
    if (visitorInfo.ipAddress) {
      activeVisitors.set(visitorInfo.ipAddress, {
        lastSeen: new Date(),
        userId: null,
      });
    }

    console.log("[trackPublicVisit] Active visitors count:", activeVisitors.size);

    // Throttle: skip DB write if already tracked this IP recently
    const throttleKey = visitorInfo.ipAddress || "unknown";
    const lastRecorded = guestThrottle.get(throttleKey);
    const now = Date.now();

    if (lastRecorded && now - lastRecorded < GUEST_THROTTLE_MS) {
      console.log("[trackPublicVisit] THROTTLED — skipping DB write for:", throttleKey);
      return res.json({ success: true, throttled: true });
    }

    await prisma.userActivity.create({
      data: {
        userId: null,
        action: visitorInfo.action,
        deviceType: visitorInfo.deviceType,
        os: visitorInfo.os,
        browser: visitorInfo.browser,
        city: visitorInfo.city,
        country: visitorInfo.country,
        ipAddress: visitorInfo.ipAddress,
      },
    });

    guestThrottle.set(throttleKey, now);
    console.log("[trackPublicVisit] ✅ Guest UserActivity SAVED for:", throttleKey);
    res.json({ success: true });
  } catch (err) {
    console.error("Error tracking public visit:", err);
    res.json({ success: false });
  }
};

// ============================================================
// GET /api/analytics/map-data
// City data for the Algeria map visualization
// ============================================================
// ============================================================
// City-to-Wilaya mapping — geoip-lite uses English city names,
// but the Algeria map component uses official wilaya names
// ============================================================
const CITY_TO_WILAYA = {
  // Direct matches (geoip city → wilaya name)
  "adrar": "Adrar", "chlef": "Chlef", "laghouat": "Laghouat",
  "oum el bouaghi": "Oum El Bouaghi", "batna": "Batna",
  "bejaia": "Béjaïa", "béjaïa": "Béjaïa", "bgayet": "Béjaïa",
  "biskra": "Biskra", "bechar": "Béchar", "béchar": "Béchar",
  "blida": "Blida", "bouira": "Bouira",
  "tamanrasset": "Tamanrasset", "tebessa": "Tébessa", "tébessa": "Tébessa",
  "tlemcen": "Tlemcen", "tiaret": "Tiaret",
  "tizi ouzou": "Tizi Ouzou", "tizi-ouzou": "Tizi Ouzou",
  "algiers": "Alger", "alger": "Alger",
  "djelfa": "Djelfa", "jijel": "Jijel",
  "setif": "Sétif", "sétif": "Sétif",
  "saida": "Saïda", "saïda": "Saïda",
  "skikda": "Skikda",
  "sidi bel abbes": "Sidi Bel Abbès", "sidi bel abbès": "Sidi Bel Abbès",
  "annaba": "Annaba", "guelma": "Guelma",
  "constantine": "Constantine",
  "medea": "Médéa", "médéa": "Médéa",
  "mostaganem": "Mostaganem",
  "m'sila": "M'Sila", "msila": "M'Sila",
  "mascara": "Mascara", "ouargla": "Ouargla",
  "oran": "Oran", "el bayadh": "El Bayadh", "illizi": "Illizi",
  "bordj bou arreridj": "Bordj Bou Arréridj", "bordj bou arréridj": "Bordj Bou Arréridj",
  "boumerdes": "Boumerdès", "boumerdès": "Boumerdès",
  "el tarf": "El Tarf", "tindouf": "Tindouf",
  "tissemsilt": "Tissemsilt",
  "el oued": "El Oued", "khenchela": "Khenchela",
  "souk ahras": "Souk Ahras", "tipaza": "Tipaza", "tipasa": "Tipaza",
  "mila": "Mila",
  "ain defla": "Aïn Defla", "aïn defla": "Aïn Defla",
  "naama": "Naâma", "naâma": "Naâma",
  "ain temouchent": "Aïn Témouchent", "aïn témouchent": "Aïn Témouchent",
  "ghardaia": "Ghardaïa", "ghardaïa": "Ghardaïa",
  "relizane": "Relizane",
  "el m'ghair": "El M'ghair", "el mghair": "El M'ghair",
  "el menia": "El Menia", "ouled djellal": "Ouled Djellal",
  "bordj baji mokhtar": "Bordj Baji Mokhtar",
  "beni abbes": "Béni Abbès", "béni abbès": "Béni Abbès",
  "timimoun": "Timimoun", "touggourt": "Touggourt",
  "djanet": "Djanet", "in salah": "In Salah", "in guezzam": "In Guezzam",
};

const normalizeCity = (city) => {
  if (!city) return null;
  return CITY_TO_WILAYA[city.toLowerCase()] || city;
};

export const getMapData = async (req, res) => {
  try {
    const { type = "visitor" } = req.query;
    const since = startOfMonth(new Date());

    let result = {};

    if (type === "click") {
      // Click map: group product clicks by the company/product location (use UserActivity with action containing "click")
      const stats = await prisma.userActivity.groupBy({
        by: ["city"],
        where: {
          createdAt: { gte: since },
          city: { not: null },
          action: { contains: "click" },
        },
        _count: { city: true },
        orderBy: { _count: { city: "desc" } },
      });

      for (const s of stats) {
        const wilaya = normalizeCity(s.city);
        if (wilaya) {
          result[wilaya] = (result[wilaya] || 0) + s._count.city;
        }
      }
    } else {
      // Visitor map: group all visits by city
      const stats = await prisma.userActivity.groupBy({
        by: ["city"],
        where: {
          createdAt: { gte: since },
          city: { not: null },
        },
        _count: { city: true },
        orderBy: { _count: { city: "desc" } },
      });

      for (const s of stats) {
        const wilaya = normalizeCity(s.city);
        if (wilaya) {
          result[wilaya] = (result[wilaya] || 0) + s._count.city;
        }
      }
    }

    res.json(result);
  } catch (err) {
    console.error("Error fetching map data:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
