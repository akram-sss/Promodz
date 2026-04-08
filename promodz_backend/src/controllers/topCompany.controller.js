import { prisma } from "../utils/prisma.js";

// GET /api/top-companies - Public
export const getTopCompanies = async (req, res) => {
  try {
    const topCompanies = await prisma.topCompany.findMany({
      orderBy: { position: "asc" },
      include: {
        company: {
          select: {
            id: true,
            username: true,
            fullName: true,
            companyName: true,
            image: true,
            handle: true,
            website: true,
          },
        },
      },
    });

    const formatted = topCompanies.map((tc) => ({
      id: tc.id,
      companyId: tc.companyId,
      name: tc.name,
      text: tc.text,
      logo: tc.logo,
      image: tc.image,
      CompanyLink: tc.companyLink,
      position: tc.position,
      company: tc.company,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching top companies:", error);
    res.status(500).json({ error: "Failed to fetch top companies" });
  }
};

// POST /api/top-companies - SUPER_ADMIN only
export const createTopCompany = async (req, res) => {
  try {
    const { companyId, name, text, logo, image, companyLink, position } = req.body;

    if (!companyId || !name) {
      return res.status(400).json({ error: "companyId and name are required" });
    }

    // Verify company exists
    const company = await prisma.user.findUnique({
      where: { id: companyId },
    });
    if (!company || company.role !== "ENTREPRISE") {
      return res.status(404).json({ error: "Company not found" });
    }

    const topCompany = await prisma.topCompany.create({
      data: {
        companyId,
        name,
        text: text || null,
        logo: logo || null,
        image: image || null,
        companyLink: companyLink || null,
        position: position || 0,
      },
      include: {
        company: {
          select: {
            id: true,
            fullName: true,
            companyName: true,
            image: true,
          },
        },
      },
    });

    res.status(201).json({
      id: topCompany.id,
      companyId: topCompany.companyId,
      name: topCompany.name,
      text: topCompany.text,
      logo: topCompany.logo,
      image: topCompany.image,
      CompanyLink: topCompany.companyLink,
      position: topCompany.position,
      company: topCompany.company,
    });
  } catch (error) {
    console.error("Error creating top company:", error);
    res.status(500).json({ error: "Failed to create top company" });
  }
};

// PUT /api/top-companies/:id - SUPER_ADMIN only
export const updateTopCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, text, logo, image, companyLink, position } = req.body;

    const existing = await prisma.topCompany.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Top company not found" });
    }

    const updated = await prisma.topCompany.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(text !== undefined && { text }),
        ...(logo !== undefined && { logo }),
        ...(image !== undefined && { image }),
        ...(companyLink !== undefined && { companyLink }),
        ...(position !== undefined && { position }),
      },
      include: {
        company: {
          select: {
            id: true,
            fullName: true,
            companyName: true,
            image: true,
          },
        },
      },
    });

    res.json({
      id: updated.id,
      companyId: updated.companyId,
      name: updated.name,
      text: updated.text,
      logo: updated.logo,
      image: updated.image,
      CompanyLink: updated.companyLink,
      position: updated.position,
      company: updated.company,
    });
  } catch (error) {
    console.error("Error updating top company:", error);
    res.status(500).json({ error: "Failed to update top company" });
  }
};

// DELETE /api/top-companies/:id - SUPER_ADMIN only
export const deleteTopCompany = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.topCompany.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Top company not found" });
    }

    await prisma.topCompany.delete({ where: { id } });

    res.json({ message: "Top company removed successfully" });
  } catch (error) {
    console.error("Error deleting top company:", error);
    res.status(500).json({ error: "Failed to delete top company" });
  }
};

// PUT /api/top-companies/reorder - SUPER_ADMIN only (batch update positions)
export const reorderTopCompanies = async (req, res) => {
  try {
    const { order } = req.body; // [{ id, position }, ...]

    if (!Array.isArray(order)) {
      return res.status(400).json({ error: "order must be an array of { id, position }" });
    }

    await prisma.$transaction(
      order.map((item) =>
        prisma.topCompany.update({
          where: { id: item.id },
          data: { position: item.position },
        })
      )
    );

    res.json({ message: "Top companies reordered successfully" });
  } catch (error) {
    console.error("Error reordering top companies:", error);
    res.status(500).json({ error: "Failed to reorder top companies" });
  }
};
