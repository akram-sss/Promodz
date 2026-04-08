import express from "express";
import {
  createAd,
  getAllAdsForManagement,
  updateAd,
  toggleAdStatus,
  deleteAd,
  getAdStats,
  getActiveAds,
  getAdsByPosition,
  trackAdClick,
} from "../controllers/adController.js";
import { authenticate } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/authorize.js";

const router = express.Router();

// ===================== PUBLIC ROUTES (All users can access) =====================
router.get("/public/active", getActiveAds); // All users can see active ads
router.get("/public/position/:position", getAdsByPosition); // Get ads by specific position
router.post("/public/:id/click", trackAdClick); // Track ad click

// ===================== SUPER ADMIN ROUTES =====================
router.post("/", authenticate, authorizeRoles("SUPER_ADMIN"), createAd);
router.get("/management", authenticate, authorizeRoles("SUPER_ADMIN", "ADMIN"), getAllAdsForManagement);
router.put("/:id", authenticate, authorizeRoles("SUPER_ADMIN"), updateAd);
router.patch("/:id/toggle-status", authenticate, authorizeRoles("SUPER_ADMIN"), toggleAdStatus);
router.delete("/:id", authenticate, authorizeRoles("SUPER_ADMIN"), deleteAd);
router.get("/stats", authenticate, authorizeRoles("SUPER_ADMIN", "ADMIN"), getAdStats);

export default router;