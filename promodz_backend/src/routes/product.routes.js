import express from "express";
import { createProduct, getActiveProducts, getProducts } from "../controllers/product.controller.js";
import { authenticate } from "../middleware/auth.js";
import { optionalAuth } from "../middleware/auth.js";
import { incrementProductClick } from "../controllers/product.controller.js";
import { getRecommendedProducts, getPopularProducts } from "../controllers/product.controller.js";
import { deleteProduct, updateProductExpiry } from "../controllers/product.controller.js";
import { getDeletedProducts } from "../controllers/product.controller.js";
import { getCategories, searchProducts, getCompanyPublicInfo, updateProductDetails, getTrendingSearches, getSearchSuggestions, syncCategories } from "../controllers/product.controller.js";
const router = express.Router();

// ===================== PUBLIC ROUTES =====================
router.get("/categories", getCategories);
router.get("/trending-searches", getTrendingSearches);
router.get("/suggestions", getSearchSuggestions);
router.get("/search", optionalAuth, searchProducts);
router.get("/popular", getPopularProducts);
router.get("/active", getActiveProducts);
router.get("/company/:companyName", getCompanyPublicInfo);
router.get("/", getProducts);

// ===================== PUBLIC CLICK TRACKING =====================
router.post("/:productId/click", incrementProductClick);

// ===================== AUTHENTICATED ROUTES =====================
router.post("/", authenticate, createProduct);
router.get("/recommendations", authenticate, getRecommendedProducts);
router.delete("/:productId", authenticate, deleteProduct);
router.patch("/:productId", authenticate, updateProductDetails);
router.patch("/:productId/expiry", authenticate, updateProductExpiry);
router.get("/deleted", authenticate, getDeletedProducts);
router.post("/categories/sync", authenticate, syncCategories);
export default router;
