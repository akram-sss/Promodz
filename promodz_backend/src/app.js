import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import productRoutes from "./routes/product.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import companyRoutes from "./routes/company.routes.js";
import super_adminRoutes from "./routes/super_admin.routes.js";
import feedbackRoutes from "./routes/feedback.routes.js";

import { authenticate } from "./middleware/auth.js";
import { trackVisitor } from "./middleware/trackVisitor.js";
import { authorizeRoles } from "./middleware/authorize.js";
import { trackPublicVisit } from "./controllers/analytics.controller.js";
import adRoutes from "./routes/adRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import topCompanyRoutes from "./routes/topCompany.routes.js";
import legalRoutes from "./routes/legal.routes.js";

import path from "path";



dotenv.config();

const app = express();

// Security headers
app.use(helmet());

// CORS — restrict to frontend origin in production
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
];
app.use(cors({
  origin(origin, cb) {
    // allow server-to-server / Postman (no origin) + listed origins
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    // In development, allow any local-network origin (LAN / WiFi testing)
    if (process.env.NODE_ENV !== 'production' && origin && /^https?:\/\/(localhost|127\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/.test(origin)) {
      return cb(null, true);
    }
    cb(new Error('CORS not allowed'));
  },
  credentials: true,
}));

// Body parsing with size limit (10mb to support base64 image uploads)
app.use(express.json({ limit: '10mb' }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ===================== PUBLIC ROUTES (before auth wall) =====================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/ads", adRoutes);
app.use("/api/top-companies", topCompanyRoutes);
app.use("/api/legal", legalRoutes);
app.use("/api/feedback", feedbackRoutes);  // public contact route is inside

// Public analytics endpoint (guest visitor tracking — no auth)
app.post("/api/analytics/track-visit", trackPublicVisit);

// ===================== AUTHENTICATED ROUTES (after auth wall) =====================
app.use(authenticate, trackVisitor);

app.use("/api/superadmin", authorizeRoles("SUPER_ADMIN"), super_adminRoutes);
app.use("/api/analytics", authorizeRoles("SUPER_ADMIN", "ADMIN", "ENTREPRISE"), analyticsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/subscriptions", subscriptionRoutes);

// Global error handler — prevent stack trace leaks
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ error: 'Internal server error' });
});

export default app;
