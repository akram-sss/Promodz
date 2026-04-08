import express from 'express';
import rateLimit from 'express-rate-limit';
import { loginUser } from '../controllers/user.controller.js';
import { refreshAccessToken } from '../controllers/auth.controller.js';
import { resetPasswordWithCode, sendResetCode } from '../middleware/auth.js';
const router = express.Router();

// Rate limiters for brute-force protection
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // 10 attempts per window
  message: { error: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many reset attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', loginLimiter, loginUser);
router.post('/refresh-token', refreshAccessToken);
router.post("/reset-password/send-code", resetLimiter, sendResetCode);
router.post("/reset-password/verify", resetLimiter, resetPasswordWithCode);

export default router;
