// src/controllers/passwordReset.controller.js
// Extracted from middleware/auth.js — controller logic belongs in controllers/
import crypto from "crypto";
import bcrypt from "bcrypt";
import { prisma } from "../utils/prisma.js";
import { sendPasswordResetEmail } from "../utils/email.js";
import { validatePassword } from "../utils/validate.js";

export const sendResetCode = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

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

    try {
      await sendPasswordResetEmail(email, code);
    } catch (emailErr) {
      console.error("Email send failed:", emailErr.message);
      // In production, do NOT log the code — fail silently
      if (process.env.NODE_ENV !== 'production') {
        console.log("DEV ONLY — Reset code for", email, ":", code);
      }
    }

    res.json({ message: "Verification code sent to email" });
  } catch (err) {
    console.error("sendResetCode error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const resetPasswordWithCode = async (req, res) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Validate password strength
  const pwError = validatePassword(newPassword);
  if (pwError) {
    return res.status(400).json({ error: pwError });
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
    console.error("resetPasswordWithCode error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
