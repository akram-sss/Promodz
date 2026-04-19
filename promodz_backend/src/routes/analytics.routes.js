import express from "express";
import rateLimit from "express-rate-limit";
import {
  getMostClickedCompanies,
  getMostClickedProducts,
  getMonthlyCityStats,
  getMonthlyDeviceStats,
  getPromotionPerformance,
  getCompanyCityStats,
  getCompanyDeviceStats,
  getOverviewStats,
  getVisitorStats,
  getBrowserStats,
  getOsStats,
  trackPublicVisit,
  getMapData,
} from "../controllers/analytics.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

const visitLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: { error: 'Too many requests' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ===================== PUBLIC (no auth) =====================
router.post("/track-visit", visitLimiter, trackPublicVisit);

// ===================== AUTHENTICATED (behind authorizeRoles in app.js) =====================
router.get("/most-clicked-companies", authenticate, getMostClickedCompanies);
router.get("/most-clicked-products", authenticate, getMostClickedProducts);
router.get("/city-stats/monthly", authenticate, getMonthlyCityStats);
router.get("/devices/monthly", authenticate, getMonthlyDeviceStats);
router.get("/promotion-performance", authenticate, getPromotionPerformance);
router.get("/company-city-stats", authenticate, getCompanyCityStats);
router.get("/company-device-stats", authenticate, getCompanyDeviceStats);
router.get("/overview-stats", authenticate, getOverviewStats);
router.get("/visitor-stats", authenticate, getVisitorStats);
router.get("/browser-stats", authenticate, getBrowserStats);
router.get("/os-stats", authenticate, getOsStats);
router.get("/map-data", authenticate, getMapData);

export default router;
