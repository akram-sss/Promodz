import express from "express";
import rateLimit from "express-rate-limit";
import { authenticate } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/authorize.js";
import {
  sendFeedback,
  sendContactMessage,
  getAllFeedbacks,
  deleteFeedback,
} from "../controllers/feedback.controller.js";

const router = express.Router();

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many messages, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// PUBLIC — guest contact form (no auth required)
router.post("/contact", contactLimiter, sendContactMessage);

// Authenticated feedback
router.post("/", authenticate, sendFeedback);

router.get("/", authenticate, authorizeRoles("SUPER_ADMIN", "ADMIN"), getAllFeedbacks);
router.delete("/:feedbackId", authenticate, authorizeRoles("SUPER_ADMIN", "ADMIN"), deleteFeedback);

export default router;
