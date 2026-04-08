import { prisma } from "../utils/prisma.js";

// GET /api/legal — Public: Get all legal sections
export const getLegalSections = async (req, res) => {
  try {
    const sections = await prisma.legalSection.findMany({
      orderBy: { position: "asc" },
    });
    res.json(sections);
  } catch (error) {
    console.error("Error fetching legal sections:", error);
    res.status(500).json({ error: "Failed to fetch legal sections" });
  }
};

// POST /api/legal — SUPER_ADMIN: Create a legal section
export const createLegalSection = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title?.trim() || !description?.trim()) {
      return res.status(400).json({ error: "Title and description are required" });
    }

    // Auto-assign position to end
    const maxPos = await prisma.legalSection.aggregate({ _max: { position: true } });
    const position = (maxPos._max.position ?? -1) + 1;

    const section = await prisma.legalSection.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        position,
      },
    });

    res.status(201).json(section);
  } catch (error) {
    console.error("Error creating legal section:", error);
    res.status(500).json({ error: "Failed to create legal section" });
  }
};

// PUT /api/legal/:id — SUPER_ADMIN: Update a legal section
export const updateLegalSection = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    if (!title?.trim() || !description?.trim()) {
      return res.status(400).json({ error: "Title and description are required" });
    }

    const section = await prisma.legalSection.update({
      where: { id },
      data: {
        title: title.trim(),
        description: description.trim(),
      },
    });

    res.json(section);
  } catch (error) {
    console.error("Error updating legal section:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Section not found" });
    }
    res.status(500).json({ error: "Failed to update legal section" });
  }
};

// DELETE /api/legal/:id — SUPER_ADMIN: Delete a legal section
export const deleteLegalSection = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.legalSection.delete({ where: { id } });
    res.json({ message: "Section deleted successfully" });
  } catch (error) {
    console.error("Error deleting legal section:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Section not found" });
    }
    res.status(500).json({ error: "Failed to delete legal section" });
  }
};

// PUT /api/legal/reorder — SUPER_ADMIN: Reorder legal sections
export const reorderLegalSections = async (req, res) => {
  try {
    const { order } = req.body; // array of { id, position }

    if (!Array.isArray(order)) {
      return res.status(400).json({ error: "Order must be an array" });
    }

    await prisma.$transaction(
      order.map(({ id, position }) =>
        prisma.legalSection.update({
          where: { id },
          data: { position },
        })
      )
    );

    res.json({ message: "Sections reordered successfully" });
  } catch (error) {
    console.error("Error reordering legal sections:", error);
    res.status(500).json({ error: "Failed to reorder sections" });
  }
};
