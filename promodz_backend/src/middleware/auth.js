// src/middleware/auth.js
import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma.js";
import { activeUsers } from "../utils/activeUsers.js";

export const authenticate = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from DB to check if banned
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(401).json({ error: "User not found" });
    if (user.isBanned) return res.status(403).json({ error: "User is banned" });

    // Attach user info to request
    req.user = {
      id: user.id,
      role: user.role,
      email: user.email,
      username: user.username,
    };

    // Optional: mark user as active for online tracking
    if (activeUsers) {
      // Clear previous timer to prevent memory leak
      const prev = activeUsers.get(user.id);
      if (prev?._timer) clearTimeout(prev._timer);
      const entry = { ...req.user, lastSeen: new Date() };
      entry._timer = setTimeout(() => activeUsers.delete(user.id), 15 * 60 * 1000);
      activeUsers.set(user.id, entry);
    }

    next();
  } catch (err) {
    console.error("Authentication error:", err);
    return res.status(401).json({ error: "Invalid token" });
  }
};

/**
 * Optional authentication middleware.
 * If a valid token is present, attaches req.user. Otherwise, continues without error.
 */
export const optionalAuth = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (user && !user.isBanned) {
      req.user = {
        id: user.id,
        role: user.role,
        email: user.email,
        username: user.username,
      };
    }
  } catch {
    // Token invalid — that's fine, just continue as guest
  }
  next();
};

import crypto from "crypto";
import bcrypt from "bcrypt";
import { sendPasswordResetEmail } from "../utils/email.js";

export const sendResetCode = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const code = crypto.randomInt(100000, 999999).toString();

    await prisma.user.update({
      where: { email },
      data: {
        resetCode: code,
        resetCodeExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 min
      },
    });

    // Send real email; fallback to console log if SMTP not configured
    try {
      await sendPasswordResetEmail(email, code);
    } catch (emailErr) {
      console.error("Email send failed:", emailErr);
      console.log("Reset code for", email, ":", code);
    }

    res.json({ message: "Verification code sent to email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const resetPasswordWithCode = async (req, res) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (
      !user ||
      user.resetCode !== code ||
      user.resetCodeExpiry < new Date()
    ) {
      return res.status(400).json({ error: "Invalid or expired code" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        resetCode: null,
        resetCodeExpiry: null,
      },
    });

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};
