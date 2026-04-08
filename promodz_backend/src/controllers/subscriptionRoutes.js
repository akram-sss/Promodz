import express from "express";
import {
  assignSubscription,
  cancelSubscription,
  getAllSubscriptions,
  getCompanySubscription,
  getSubscriptionStats,
  createInvoice,
  getMySubscription,
} from "../controllers/subscriptionController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ===================== SUPER ADMIN ROUTES =====================
router.post("/assign", authenticateToken, assignSubscription);
router.post("/cancel/:companyId", authenticateToken, cancelSubscription);
router.get("/all", authenticateToken, getAllSubscriptions);
router.get("/stats", authenticateToken, getSubscriptionStats);
router.post("/invoice", authenticateToken, createInvoice);
router.get("/company/:companyId", authenticateToken, getCompanySubscription);

// ===================== COMPANY ROUTES =====================
router.get("/my-subscription", authenticateToken, getMySubscription);

export default router;