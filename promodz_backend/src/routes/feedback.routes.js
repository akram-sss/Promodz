import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  sendFeedback,
  sendContactMessage,
  getAllFeedbacks,
  deleteFeedback,
} from "../controllers/feedback.controller.js";

const router = express.Router();

// PUBLIC — guest contact form (no auth required)
router.post("/contact", sendContactMessage);

// Authenticated feedback
router.post("/", authenticate, sendFeedback);

router.get("/", authenticate, getAllFeedbacks);
router.delete("/:feedbackId", authenticate, deleteFeedback);

export default router;
