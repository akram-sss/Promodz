// src/middleware/authorizeCompany.js
import { prisma } from "../utils/prisma.js";

export const authorizeCompanyAdminOrSuperAdmin = async (req, res, next) => {
  try {
    const user = req.user;

    // Super admin has full access
    if (user.role === "SUPER_ADMIN") {
      return next();
    }

    // ENTREPRISE user - the company itself; companyId is their own user id
    if (user.role === "ENTREPRISE") {
      req.companyId = user.id;
      return next();
    }

    // Otherwise check if user is assigned as company admin
    const companyAdmin = await prisma.companyAdmin.findFirst({
      where: { adminId: user.id },
    });

    if (!companyAdmin) {
      return res.status(403).json({ error: "Access denied. Not a company admin or superadmin." });
    }

    // Attach companyId to request for later queries
    req.companyId = companyAdmin.companyId;
    next();
  } catch (err) {
    console.error("Authorization error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
