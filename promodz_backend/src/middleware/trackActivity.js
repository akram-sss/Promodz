// src/middleware/trackActivity.js
import { prisma } from "../utils/prisma.js";


import { activeUsers } from "../utils/activeUsers.js";

export const trackActivity = (req, res, next) => {
  if (req.user?.id) {
    activeUsers.set(req.user.id, {
      ...req.user,
      lastSeen: new Date()
    });
  }
  next();
};
