import { verifyRefreshToken, generateAccessToken } from "../utils/jwt.js";

import { prisma } from "../utils/prisma.js";

export const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: "Refresh token required" });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);

    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { isBanned: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.isBanned) {
      return res.status(403).json({ error: "Your account has been banned. Contact support." });
    }


    const newAccessToken = generateAccessToken({
      id: decoded.id,
      role: decoded.role,
    });

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired refresh token" });
  }
};
