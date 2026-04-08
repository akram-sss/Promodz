import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const incrementCompanyClick = async (req, res) => {
  const { companyId } = req.params;

  console.log("[companyClick] Received click for companyId:", companyId);

  if (!companyId) {
    return res.status(400).json({ error: "Company ID is required" });
  }

  try {
    // Check that it's a real company
    const company = await prisma.user.findFirst({
      where: {
        id: companyId,
        role: "ENTREPRISE",
      },
    });

    if (!company) {
      console.log("[companyClick] ❌ Company not found:", companyId);
      return res.status(404).json({ error: "Company not found" });
    }

    // Extract visitor info for richer analytics
    const forwarded = req.headers["x-forwarded-for"];
    const ipAddress = forwarded ? forwarded.split(",")[0].trim() : req.socket?.remoteAddress || null;
    const userAgent = req.headers["user-agent"] || null;
    const userId = req.user?.id || null;

    console.log("[companyClick] IP:", ipAddress, "| User:", userId || "guest", "| Company:", company.fullName);

    await prisma.companyClick.create({
      data: { companyId, userId, ipAddress, userAgent },
    });

    console.log("[companyClick] ✅ Click SAVED for company:", company.fullName, "(", companyId, ")");
    res.status(200).json({ message: "Company click recorded" });
  } catch (error) {
    console.error("[companyClick] ❌ Error recording company click:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const getCompanyProducts = async (req, res) => {
  const user = req.user;

  if (user.role !== "ENTREPRISE") {
    return res.status(403).json({ error: "Only companies can access this" });
  }

  try {
    // Get assigned admins
    const assignedAdmins = await prisma.companyAdmin.findMany({
      where: { companyId: user.id },
      select: { adminId: true },
    });

    const adminIds = assignedAdmins.map(a => a.adminId);

    // Get all super admins
    const superAdmins = await prisma.user.findMany({
      where: { role: "SUPER_ADMIN" },
      select: { id: true },
    });

    const superAdminIds = superAdmins.map(s => s.id);

    // Combine: company itself + assigned admins + super admins
    const creatorIds = [user.id, ...adminIds, ...superAdminIds];

    const products = await prisma.product.findMany({
      where: {
        companyId: user.id,
        status: "ACTIVE",
        createdById: {
          in: creatorIds,
        },
      },
      include: {
        createdBy: {
          select: {
            id: true,
            fullName: true,
            role: true,
          },
        },
        category: { select: { name: true } },
        subCategory: { select: { name: true } },
        _count: { select: { favorites: true, clicks: true, ratings: true } },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching company products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const getCompanyStats = async (req, res) => {
  try {
    // For ENTREPRISE users, the user IS the company
    const companyId = req.user.id;
    const now = new Date();

    // Count followers
    const followers = await prisma.companyFollow.count({
      where: { companyId },
    });

    // Count products
    const activeProducts = await prisma.product.count({
      where: {
        companyId,
        status: "ACTIVE",
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } }, // still valid
        ],
      },
    });

    const expiredProducts = await prisma.product.count({
      where: {
        companyId,
        OR: [
          { status: "EXPIRED" },
          { expiresAt: { lt: now } }, // expired by date
        ],
      },
    });

    const deletedProducts = await prisma.product.count({
      where: { companyId, status: "DELETED" },
    });

    res.json({
      followers,
      activeProducts,
      expiredProducts,
      deletedProducts,
    });
  } catch (error) {
    console.error("Error fetching company stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const getCompanyStatsPublic = async (req, res) => {
  const { companyId } = req.params;

  try {
    const followersCount = await prisma.companyFollow.count({
      where: { companyId }
    });

    const activePromotions = await prisma.product.count({
      where: { companyId, status: "ACTIVE" }
    });

    res.json({
      followersCount,
      activePromotions
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const getCompanyStatsAdmin = async (req, res) => {
  const { companyId } = req.params;

  // Check if user is SUPER_ADMIN or assigned admin with view permission
  const userRole = req.user.role;
  if (userRole !== "SUPER_ADMIN") {
    const assignment = await prisma.companyAdmin.findFirst({
      where: {
        adminId: req.user.id,
        companyId,
        canViews: true
      }
    });
    if (!assignment) return res.status(403).json({ error: "Forbidden" });
  }

  try {
    const now = new Date();

    const followersCount = await prisma.companyFollow.count({
      where: { companyId }
    });

    const activePromotions = await prisma.product.count({
      where: { companyId, status: "ACTIVE" }
    });

    const expiredPromotions = await prisma.product.count({
      where: { companyId, status: "EXPIRED" }
    });

    const deletedPromotions = await prisma.product.count({
      where: { companyId, status: "DELETED" }
    });

    res.json({
      followersCount,
      activePromotions,
      expiredPromotions,
      deletedPromotions
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};