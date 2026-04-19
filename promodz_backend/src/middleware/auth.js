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

    // Fetch user from DB to check if banned/deleted
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(401).json({ error: "User not found" });
    if (user.isDeleted) return res.status(403).json({ error: "Account has been deleted" });
    if (user.isBanned) return res.status(403).json({ error: "User is banned" });

    // Attach user info to request
    req.user = {
      id: user.id,
      role: user.role,
      email: user.email,
      username: user.username,
    };

    // Mark user as active for online tracking (no per-entry timer — cleaned by periodic sweep)
    if (activeUsers) {
      activeUsers.set(user.id, { ...req.user, lastSeen: new Date() });
    }

    next();
  } catch (err) {
    console.error("Authentication error:", err.message);
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
    if (user && !user.isBanned && !user.isDeleted) {
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
