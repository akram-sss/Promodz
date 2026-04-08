import express from "express";
import {
  assignSubscription,
  cancelSubscription,
  getAllSubscriptions,
  getCompanySubscription,
  getSubscriptionStats,
  createInvoice,
  getMySubscription,
  updateSubscriptionDates,
} from "../controllers/subscriptionController.js";
import { authenticate } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/authorize.js";

const router = express.Router();

// ===================== SUPER ADMIN ROUTES =====================
router.post("/assign", authenticate, authorizeRoles("SUPER_ADMIN"), assignSubscription);
router.post("/cancel/:companyId", authenticate, authorizeRoles("SUPER_ADMIN"), cancelSubscription);
router.get("/all", authenticate, authorizeRoles("SUPER_ADMIN", "ADMIN"), getAllSubscriptions);
router.get("/stats", authenticate, authorizeRoles("SUPER_ADMIN"), getSubscriptionStats);
router.post("/invoice", authenticate, authorizeRoles("SUPER_ADMIN"), createInvoice);
router.get("/company/:companyId", authenticate, authorizeRoles("SUPER_ADMIN", "ADMIN"), getCompanySubscription);

// ===================== ADMIN (MODERATOR) ROUTES =====================
// Moderators can only update subscription dates (start/end), not plan/status/price
router.patch("/company/:companyId/dates", authenticate, authorizeRoles("SUPER_ADMIN", "ADMIN"), updateSubscriptionDates);

// ===================== COMPANY ROUTES =====================
router.get("/my-subscription", authenticate, getMySubscription);

export default router;