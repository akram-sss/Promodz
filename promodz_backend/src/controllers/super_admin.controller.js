import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Assign admin to a company
export const  assignAdminToCompany = async (req, res) => {
  try {
    if (req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ error: "Forbidden: Only super admins can assign admins to companies." });
    }

    const { adminId, companyId, canViews = true, canEdit = true, canDelete = true } = req.body;

    // Validate admin user
    const adminUser = await prisma.user.findUnique({ where: { id: adminId } });
    if (!adminUser || adminUser.role !== "ADMIN") {
      return res.status(400).json({ error: "Invalid admin user ID or user is not an admin." });
    }

    // Validate company user
    const companyUser = await prisma.user.findUnique({ where: { id: companyId } });
    if (!companyUser || companyUser.role !== "ENTREPRISE") {
      return res.status(400).json({ error: "Invalid company user ID or user is not a company." });
    }

    // Check if assignment already exists
    const existingAssignment = await prisma.companyAdmin.findFirst({
      where: { adminId, companyId },
    });
    if (existingAssignment) {
      return res.status(400).json({ error: "Admin is already assigned to this company." });
    }

    // Create the assignment with permission flags
    const assignment = await prisma.companyAdmin.create({
      data: {
        adminId,
        companyId,
        canViews,
        canEdit,
        canDelete,
      },
    });

    res.status(201).json({ message: "Admin assigned to company successfully.", assignment });
  } catch (error) {
    console.error("Assign admin error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Unassign admin from company
export const unassignAdminFromCompany = async (req, res) => {
  const { adminId, companyId } = req.params;

  if (req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({ error: "Only super admins can unassign admins." });
  }

  try {
    const link = await prisma.companyAdmin.findFirst({
      where: { adminId, companyId },
    });

    if (!link) {
      return res.status(404).json({ error: "Assignment not found." });
    }

    await prisma.companyAdmin.delete({ where: { id: link.id } });
    res.status(200).json({ message: "Admin unassigned from company." });
  } catch (error) {
    console.error("Error unassigning admin:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Ban user (SUPER_ADMIN only)
export const banUser = async (req, res) => {
  const { userId } = req.params;

  if (req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({ error: "Only super admins can ban users." });
  }

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { isBanned: true },
    });

    res.json({ message: `User ${user.username} has been banned`, user });
  } catch (err) {
    console.error("Error banning user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Optional: unban user
export const unbanUser = async (req, res) => {
  const { userId } = req.params;

  if (req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({ error: "Only super admins can unban users." });
  }

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { isBanned: false },
    });

    res.json({ message: `User ${user.username} has been unbanned`, user });
  } catch (err) {
    console.error("Error unbanning user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const updateCompanyAdminPermissions = async (req, res) => {
  const { id: adminId } = req.params; // admin user id
  const { companyId, canViews, canView, canEdit, canDelete, canAdd } = req.body;

  if (!companyId) {
    return res.status(400).json({ error: "companyId is required" });
  }

  try {
    // Find the assignment by adminId + companyId
    const assignment = await prisma.companyAdmin.findFirst({
      where: { adminId, companyId },
    });

    if (!assignment) {
      return res.status(404).json({
        error: "CompanyAdmin assignment not found for this admin and company",
      });
    }

    // Build dynamic update object - accept both canView and canViews
    const updateData = {};
    const viewValue = canViews !== undefined ? canViews : canView;
    if (typeof viewValue !== "undefined") updateData.canViews = viewValue;
    if (typeof canEdit !== "undefined") updateData.canEdit = canEdit;
    if (typeof canDelete !== "undefined") updateData.canDelete = canDelete;
    if (typeof canAdd !== "undefined") updateData.canAdd = canAdd;

    if (Object.keys(updateData).length === 0) {
      return res
        .status(400)
        .json({ error: "No valid fields provided to update" });
    }

    const updated = await prisma.companyAdmin.update({
      where: { id: assignment.id },
      data: updateData,
    });

    res.json({
      message: `Permissions updated for admin ${updated.adminId} in company ${updated.companyId}`,
      updated,
    });
  } catch (error) {
    console.error("Error updating permissions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
//count for num of admin users companies
export const getGlobalStats = async (req, res) => {
  try {
   
    if (req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const [
      totalUsers,
      totalAdmins,
      totalCompanies,
      totalSuperAdmins,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.user.count({ where: { role: "ENTREPRISE" } }),
      prisma.user.count({ where: { role: "SUPER_ADMIN" } }),
    ]);

    res.json({
      users: totalUsers,
      admins: totalAdmins,
      companies: totalCompanies,
      superAdmins: totalSuperAdmins,
    });
  } catch (error) {
    console.error("Global stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Soft-delete a user (SUPER_ADMIN only)
export const softDeleteUser = async (req, res) => {
  const { userId } = req.params;

  if (req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({ error: "Only super admins can delete users." });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    if (user.role === "SUPER_ADMIN") {
      return res.status(403).json({ error: "Cannot delete a super admin." });
    }
    if (user.isDeleted) {
      return res.status(400).json({ error: "User is already deleted." });
    }

    const deletedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedById: req.user.id,
        isBanned: true, // also ban so they can't log in
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        role: true,
        deletedAt: true,
      },
    });

    res.json({ message: `User ${deletedUser.username} has been deleted.`, user: deletedUser });
  } catch (error) {
    console.error("Soft delete user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all soft-deleted users (SUPER_ADMIN only)
export const getDeletedUsers = async (req, res) => {
  if (req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({ error: "Only super admins can view deleted users." });
  }

  try {
    const { search, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { isDeleted: true };
    if (search) {
      where.OR = [
        { username: { contains: search, mode: "insensitive" } },
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          fullName: true,
          email: true,
          phoneNumber: true,
          role: true,
          image: true,
          companyName: true,
          city: true,
          country: true,
          createdAt: true,
          deletedAt: true,
          deletedBy: {
            select: { id: true, username: true, fullName: true },
          },
        },
        orderBy: { deletedAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ users, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    console.error("Get deleted users error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Restore a soft-deleted user (SUPER_ADMIN only)
export const restoreUser = async (req, res) => {
  const { userId } = req.params;

  if (req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({ error: "Only super admins can restore users." });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    if (!user.isDeleted) {
      return res.status(400).json({ error: "User is not deleted." });
    }

    const restoredUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isDeleted: false,
        deletedAt: null,
        deletedById: null,
        isBanned: false,
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        role: true,
      },
    });

    res.json({ message: `User ${restoredUser.username} has been restored.`, user: restoredUser });
  } catch (error) {
    console.error("Restore user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Permanently delete users (SUPER_ADMIN only) — hard delete from DB
export const permanentDeleteUsers = async (req, res) => {
  if (req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({ error: "Only super admins can permanently delete users." });
  }

  const { userIds } = req.body;
  if (!Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({ error: "userIds array is required." });
  }

  try {
    // Verify all users exist and are soft-deleted
    const usersToDelete = await prisma.user.findMany({
      where: { id: { in: userIds }, isDeleted: true },
      select: { id: true, username: true, role: true },
    });

    if (usersToDelete.length === 0) {
      return res.status(404).json({ error: "No soft-deleted users found with the given IDs." });
    }

    // Block deleting SUPER_ADMIN accounts
    const superAdmins = usersToDelete.filter(u => u.role === "SUPER_ADMIN");
    if (superAdmins.length > 0) {
      return res.status(403).json({ error: "Cannot permanently delete super admin accounts." });
    }

    const ids = usersToDelete.map(u => u.id);

    // Hard delete in a transaction
    await prisma.$transaction(async (tx) => {
      // Get all product IDs owned or created by these users
      const ownedProductIds = (await tx.product.findMany({ where: { companyId: { in: ids } }, select: { id: true } })).map(p => p.id);
      const createdProductIds = (await tx.product.findMany({ where: { createdById: { in: ids } }, select: { id: true } })).map(p => p.id);
      const allProductIds = [...new Set([...ownedProductIds, ...createdProductIds])];

      if (allProductIds.length > 0) {
        await tx.productClick.deleteMany({ where: { productId: { in: allProductIds } } });
        await tx.productFavorite.deleteMany({ where: { productId: { in: allProductIds } } });
        await tx.productRating.deleteMany({ where: { productId: { in: allProductIds } } });
        await tx.productEditHistory.deleteMany({ where: { productId: { in: allProductIds } } });
        await tx.product.deleteMany({ where: { id: { in: allProductIds } } });
      }

      // Nullify deletedById references on other products
      await tx.product.updateMany({ where: { deletedById: { in: ids } }, data: { deletedById: null } });

      // Delete user interactions
      await tx.productClick.deleteMany({ where: { userId: { in: ids } } });
      await tx.productFavorite.deleteMany({ where: { userId: { in: ids } } });
      await tx.productRating.deleteMany({ where: { userId: { in: ids } } });
      await tx.productEditHistory.deleteMany({ where: { userId: { in: ids } } });
      await tx.companyClick.deleteMany({ where: { OR: [{ userId: { in: ids } }, { companyId: { in: ids } }] } });
      await tx.companyFollow.deleteMany({ where: { OR: [{ userId: { in: ids } }, { companyId: { in: ids } }] } });
      await tx.companyAdmin.deleteMany({ where: { OR: [{ adminId: { in: ids } }, { companyId: { in: ids } }] } });
      await tx.userActivity.deleteMany({ where: { userId: { in: ids } } });
      await tx.feedback.deleteMany({ where: { userId: { in: ids } } });
      await tx.ad.deleteMany({ where: { createdById: { in: ids } } });

      // Delete subscription features then subscriptions
      await tx.subscriptionFeature.deleteMany({ where: { subscription: { companyId: { in: ids } } } });
      await tx.invoice.deleteMany({ where: { userId: { in: ids } } });
      await tx.subscription.deleteMany({ where: { companyId: { in: ids } } });

      // Delete support tickets, notifications, top companies
      await tx.supportTicket.deleteMany({ where: { OR: [{ userId: { in: ids } }, { companyId: { in: ids } }] } });
      await tx.notification.deleteMany({ where: { userId: { in: ids } } });
      await tx.topCompany.deleteMany({ where: { companyId: { in: ids } } });

      // Nullify self-referencing deletedById on other users
      await tx.user.updateMany({ where: { deletedById: { in: ids } }, data: { deletedById: null } });

      // Finally delete the users
      await tx.user.deleteMany({ where: { id: { in: ids } } });
    });

    res.json({
      message: `${ids.length} user(s) permanently deleted.`,
      deletedCount: ids.length,
      deletedUsers: usersToDelete.map(u => u.username),
    });
  } catch (error) {
    console.error("Permanent delete users error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
