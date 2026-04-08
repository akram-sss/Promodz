import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ===================== SUPER ADMIN ONLY FUNCTIONS =====================

// Create a new ad (SUPER_ADMIN only)
export const createAd = async (req, res) => {
  try {
    if (req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ error: "Forbidden: Only super admins can create ads." });
    }

    const { title, description, link, position, expiresAt, imageUrl } = req.body;
    
    if (!position) {
      return res.status(400).json({ error: "Position is required." });
    }

    // Validate position (slot numbers 1-8)
    const posStr = String(position);
    const validPositions = ["1", "2", "3", "4", "5", "6", "7", "8"];
    if (!validPositions.includes(posStr)) {
      return res.status(400).json({ error: "Invalid ad position. Must be 1-8." });
    }

    // Parse expiresAt if provided
    let expiresAtDate = null;
    if (expiresAt) {
      expiresAtDate = new Date(expiresAt);
      if (isNaN(expiresAtDate.getTime())) {
        return res.status(400).json({ error: "Invalid expiration date format." });
      }
    }

    const ad = await prisma.ad.create({
      data: {
        title: title || `Ad Slot ${posStr}`,
        description,
        link,
        imageUrl,
        position: posStr,
        expiresAt: expiresAtDate,
        createdById: req.user.id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    res.status(201).json({ 
      message: "Ad created successfully.", 
      ad 
    });
  } catch (error) {
    console.error("Create ad error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all ads with management view (SUPER_ADMIN only)
export const getAllAdsForManagement = async (req, res) => {
  try {
    if (req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ error: "Forbidden: Only super admins can view all ads." });
    }

    const { 
      position, 
      isActive, 
      page = 1, 
      limit = 20,
      search 
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build where clause
    const where = {};
    
    if (position) where.position = position;
    if (isActive !== undefined) where.isActive = isActive === "true";
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [ads, total] = await Promise.all([
      prisma.ad.findMany({
        where,
        include: {
          createdBy: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.ad.count({ where }),
    ]);

    res.json({
      ads,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get ads for management error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update ad (SUPER_ADMIN only)
export const updateAd = async (req, res) => {
  try {
    if (req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ error: "Forbidden: Only super admins can update ads." });
    }

    const { id } = req.params;
    const { title, description, link, position, isActive, expiresAt, imageUrl } = req.body;
    
    // Check if ad exists
    const existingAd = await prisma.ad.findUnique({
      where: { id },
    });

    if (!existingAd) {
      return res.status(404).json({ error: "Ad not found." });
    }

    // Process update data
    const updateData = {};
    
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (link !== undefined) updateData.link = link;
    if (position !== undefined) updateData.position = position;
    if (isActive !== undefined) updateData.isActive = isActive === "true";
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    
    // Handle expiration date
    if (expiresAt !== undefined) {
      if (expiresAt === null || expiresAt === "") {
        updateData.expiresAt = null;
      } else {
        const expiresAtDate = new Date(expiresAt);
        if (isNaN(expiresAtDate.getTime())) {
          return res.status(400).json({ error: "Invalid expiration date format." });
        }
        updateData.expiresAt = expiresAtDate;
      }
    }

    const updatedAd = await prisma.ad.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    res.json({
      message: "Ad updated successfully.",
      ad: updatedAd,
    });
  } catch (error) {
    console.error("Update ad error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Toggle ad active status (SUPER_ADMIN only)
export const toggleAdStatus = async (req, res) => {
  try {
    if (req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ error: "Forbidden: Only super admins can toggle ad status." });
    }

    const { id } = req.params;
    
    const ad = await prisma.ad.findUnique({
      where: { id },
    });

    if (!ad) {
      return res.status(404).json({ error: "Ad not found." });
    }

    const updatedAd = await prisma.ad.update({
      where: { id },
      data: {
        isActive: !ad.isActive,
      },
    });

    res.json({
      message: `Ad ${updatedAd.isActive ? "activated" : "deactivated"} successfully.`,
      ad: updatedAd,
    });
  } catch (error) {
    console.error("Toggle ad status error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete ad (SUPER_ADMIN only)
export const deleteAd = async (req, res) => {
  try {
    if (req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ error: "Forbidden: Only super admins can delete ads." });
    }

    const { id } = req.params;
    
    const ad = await prisma.ad.findUnique({
      where: { id },
    });

    if (!ad) {
      return res.status(404).json({ error: "Ad not found." });
    }

    await prisma.ad.delete({
      where: { id },
    });

    res.json({
      message: "Ad deleted successfully.",
    });
  } catch (error) {
    console.error("Delete ad error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get ad statistics (SUPER_ADMIN only)
export const getAdStats = async (req, res) => {
  try {
    if (req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ error: "Forbidden: Only super admins can view ad stats." });
    }

    const [totalAds, activeAds, expiredAds, adsByPosition] = await Promise.all([
      prisma.ad.count(),
      prisma.ad.count({
        where: {
          isActive: true,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } },
          ],
        },
      }),
      prisma.ad.count({
        where: {
          expiresAt: { lt: new Date() },
        },
      }),
      prisma.ad.groupBy({
        by: ["position"],
        _count: {
          id: true,
        },
        where: {
          isActive: true,
        },
      }),
    ]);

    res.json({
      totalAds,
      activeAds,
      expiredAds,
      inactiveAds: totalAds - activeAds - expiredAds,
      adsByPosition: adsByPosition.map(item => ({
        position: item.position,
        count: item._count.id,
      })),
    });
  } catch (error) {
    console.error("Get ad stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ===================== PUBLIC FUNCTIONS (ALL USERS) =====================

// Get active ads for display (PUBLIC - all users can access)
export const getActiveAds = async (req, res) => {
  try {
    const { position } = req.query;
    
    const where = {
      isActive: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    };
    
    if (position) where.position = position;

    const ads = await prisma.ad.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        link: true,
        imageUrl: true,
        position: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ 
      success: true,
      ads 
    });
  } catch (error) {
    console.error("Get active ads error:", error);
    res.status(500).json({ 
      success: false,
      error: "Internal server error" 
    });
  }
};

// Get ads by specific position (PUBLIC - all users can access)
export const getAdsByPosition = async (req, res) => {
  try {
    const { position } = req.params;
    
    if (!position) {
      return res.status(400).json({ 
        success: false,
        error: "Position parameter is required" 
      });
    }

    const ads = await prisma.ad.findMany({
      where: {
        position: String(position),
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      select: {
        id: true,
        title: true,
        description: true,
        link: true,
        imageUrl: true,
        position: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    res.json({ 
      success: true,
      position,
      ads 
    });
  } catch (error) {
    console.error("Get ads by position error:", error);
    res.status(500).json({ 
      success: false,
      error: "Internal server error" 
    });
  }
};

// Track ad click (PUBLIC)
export const trackAdClick = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.ad.update({
      where: { id },
      data: { clicks: { increment: 1 } },
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Track ad click error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};