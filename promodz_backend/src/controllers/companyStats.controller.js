// src/controllers/companyStats.controller.js
import prisma from "../prisma/client.js";

export const getCompanyStats = async (req, res) => {
  try {
    const { companyId } = req;

    // Followers
    const followersCount = await prisma.companyFollow.count({
      where: { companyId },
    });

    // Active (not expired, not deleted)
    const activeProducts = await prisma.product.count({
      where: {
        companyId,
        isDeleted: false,
        expiresAt: { gt: new Date() },
      },
    });

    // Expired
    const expiredProducts = await prisma.product.count({
      where: {
        companyId,
        isDeleted: false,
        expiresAt: { lte: new Date() },
      },
    });

    // Deleted
    const deletedProducts = await prisma.product.count({
      where: {
        companyId,
        isDeleted: true,
      },
    });

    res.json({
      followersCount,
      activeProducts,
      expiredProducts,
      deletedProducts,
    });
  } catch (err) {
    console.error("Error fetching company stats:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
