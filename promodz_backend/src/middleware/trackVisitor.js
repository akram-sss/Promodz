// src/middleware/trackVisitor.js
// Merged middleware: combines trackActivity + trackLocation + trackDevice into ONE
// Creates a single UserActivity record per request instead of duplicates
import { prisma } from "../utils/prisma.js";
import { activeUsers, activeVisitors } from "../utils/activeUsers.js";
import { UAParser } from "ua-parser-js";
import geoip from "geoip-lite";

/**
 * Map UAParser device type to Prisma DeviceType enum
 */
const mapDeviceType = (type) => {
  switch (type) {
    case "mobile":
      return "MOBILE";
    case "tablet":
      return "TABLET";
    default:
      return "DESKTOP";
  }
};

/**
 * Get IP address from request (supports proxies)
 */
const getIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.connection?.remoteAddress || req.socket?.remoteAddress || null;
};

/**
 * Parse device info from User-Agent header
 */
const parseDevice = (userAgent) => {
  if (!userAgent) return { deviceType: "DESKTOP", os: "unknown", browser: "unknown" };
  const parser = new UAParser(userAgent);
  const result = parser.getResult();
  return {
    deviceType: mapDeviceType(result.device?.type),
    os: result.os?.name || "unknown",
    browser: result.browser?.name || "unknown",
  };
};

/**
 * Parse location from IP address (Algeria only)
 * Maps geoip city names to official Algerian wilaya names
 */
const CITY_TO_WILAYA = {
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

const parseLocation = (ip) => {
  if (!ip) return { city: null, country: null };
  const geo = geoip.lookup(ip);
  if (geo && geo.country === "DZ") {
    const rawCity = geo.city || "Unknown";
    const city = CITY_TO_WILAYA[rawCity.toLowerCase()] || rawCity;
    return { city, country: "Algeria" };
  }
  return { city: null, country: null };
};

/**
 * Authenticated visitor tracking middleware
 * Creates ONE UserActivity record with device + location + user info
 * Throttled: max 1 DB record per visitor per 30 minutes to prevent inflation
 */

// Throttle map — key: userId or IP, value: last recorded timestamp
const visitThrottle = new Map();
const THROTTLE_MS = 30 * 60 * 1000; // 30 minutes

export const trackVisitor = async (req, res, next) => {
  const visitorIp = getIp(req);
  const ua = req.headers["user-agent"] || "";
  const device = parseDevice(ua);
  const location = parseLocation(visitorIp);

  // 1. Update in-memory active users (synchronous, always runs)
  if (req.user?.id) {
    activeUsers.set(req.user.id, {
      ...req.user,
      lastSeen: new Date(),
    });
  }

  // 1b. Track ALL visitors by IP (guests + authenticated)
  if (visitorIp) {
    activeVisitors.set(visitorIp, {
      lastSeen: new Date(),
      userId: req.user?.id || null,
    });
  }

  // 2. Throttle: only create a UserActivity record once per 30 min per visitor
  const throttleKey = req.user?.id || visitorIp || "unknown";
  const lastRecorded = visitThrottle.get(throttleKey);
  const now = Date.now();

  if (lastRecorded && now - lastRecorded < THROTTLE_MS) {
    return next();
  }

  // 3. Create single UserActivity record (async, non-blocking)
  try {
    await prisma.userActivity.create({
      data: {
        userId: req.user?.id || null,
        action: "visit",
        deviceType: device.deviceType,
        os: device.os,
        browser: device.browser,
        city: location.city,
        country: location.country,
        ipAddress: visitorIp,
      },
    });

    visitThrottle.set(throttleKey, now);
    console.log("[trackVisitor] ✅ SAVED | User:", req.user?.id || "guest", "| IP:", visitorIp, "| City:", location.city, "| Device:", device.deviceType);
  } catch (err) {
    console.error("[trackVisitor] ❌ Visitor tracking failed:", err);
    // Never block the request
  }

  next();
};

/**
 * Public/guest visitor tracking (for use by the tracking endpoint)
 * Returns parsed data instead of creating a record (controller handles creation)
 */
export const parseVisitorInfo = (req) => {
  const ip = getIp(req);
  const ua = req.headers["user-agent"] || "";
  const device = parseDevice(ua);
  const location = parseLocation(ip);

  return {
    userId: req.user?.id || null,
    action: "guest_visit",
    deviceType: device.deviceType,
    os: device.os,
    browser: device.browser,
    city: location.city,
    country: location.country,
    ipAddress: ip,
  };
};
