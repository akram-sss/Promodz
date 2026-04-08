import express from "express";
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

// ===================== PUBLIC (no auth) =====================
router.post("/track-visit", trackPublicVisit);

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
