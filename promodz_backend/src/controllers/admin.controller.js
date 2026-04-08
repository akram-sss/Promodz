// src/controllers/admin.controller.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getAssignedCompanies = async (req, res) => {
  const user = req.user;

  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    return res.status(403).json({ error: "Only admins can access this." });
  }

  try {
    // SUPER_ADMIN sees ALL companies with full permissions
    if (user.role === "SUPER_ADMIN") {
      const allCompanies = await prisma.user.findMany({
        where: { role: "ENTREPRISE" },
        select: { id: true, fullName: true, email: true },
      });
      const companies = allCompanies.map(c => ({
        ...c,
        permissions: { canViews: true, canEdit: true, canDelete: true, canAdd: true },
      }));
      return res.status(200).json(companies);
    }

    const assignments = await prisma.companyAdmin.findMany({
      where: { adminId: user.id },
      include: {
        company: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    const companies = assignments.map(a => ({
      ...a.company,
      permissions: {
        canViews: a.canViews,
        canEdit: a.canEdit,
        canDelete: a.canDelete,
        canAdd: a.canAdd,
      },
    }));

    res.status(200).json(companies);
  } catch (error) {
    console.error("Error fetching assigned companies:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
