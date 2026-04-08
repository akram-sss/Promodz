import express from "express";
import { authenticate } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/authorize.js";  
import { 
  assignAdminToCompany, 
  unassignAdminFromCompany, 
  banUser,
  unbanUser,
  updateCompanyAdminPermissions,
  getGlobalStats,
  softDeleteUser,
  getDeletedUsers,
  restoreUser,
  permanentDeleteUsers
} from "../controllers/super_admin.controller.js";

const router = express.Router();


router.post(
  "/assign-admin", 
  authenticate, 
  authorizeRoles("SUPER_ADMIN"), 
  assignAdminToCompany
);

router.delete(
  "/:adminId/companies/:companyId", 
  authenticate, 
  authorizeRoles("SUPER_ADMIN"), 
  unassignAdminFromCompany
);

router.patch(
  "/ban/:userId", 
  authenticate, 
  authorizeRoles("SUPER_ADMIN"), 
  banUser
);

router.patch(
  "/unban/:userId", 
  authenticate, 
  authorizeRoles("SUPER_ADMIN"), 
  unbanUser
);
router.patch(
  "/:id",
  authenticate,
  authorizeRoles("SUPER_ADMIN"),
  updateCompanyAdminPermissions
);

router.get(
  "/stats",
  authenticate,
  authorizeRoles("SUPER_ADMIN"),
  getGlobalStats
);

router.delete(
  "/users/:userId",
  authenticate,
  authorizeRoles("SUPER_ADMIN"),
  softDeleteUser
);

router.get(
  "/users/deleted",
  authenticate,
  authorizeRoles("SUPER_ADMIN"),
  getDeletedUsers
);

router.patch(
  "/users/:userId/restore",
  authenticate,
  authorizeRoles("SUPER_ADMIN"),
  restoreUser
);

router.post(
  "/users/permanent-delete",
  authenticate,
  authorizeRoles("SUPER_ADMIN"),
  permanentDeleteUsers
);

export default router;
