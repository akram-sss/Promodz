import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify SMTP connection on startup
transporter.verify()
  .then(() => console.log("✅ SMTP connection verified — email sending is ready"))
  .catch((err) => console.error("❌ SMTP connection failed:", err.message));

/**
 * Send a 6-digit verification code email
 */
export const sendVerificationEmail = async (to, code) => {
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background: #7C3AED; border-radius: 12px; padding: 12px 16px;">
          <span style="color: #fff; font-size: 24px; font-weight: bold;">Promodz</span>
        </div>
      </div>
      <h2 style="color: #1a1a1a; text-align: center; margin-bottom: 8px;">Verify Your Email</h2>
      <p style="color: #666; text-align: center; margin-bottom: 24px;">Use the code below to verify your email address and complete your registration.</p>
      <div style="background: #f3f0ff; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
        <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #7C3AED;">${code}</span>
      </div>
      <p style="color: #999; font-size: 13px; text-align: center;">This code expires in <strong>10 minutes</strong>. If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Promodz" <${process.env.SMTP_USER}>`,
    to,
    subject: "Promodz – Email Verification Code",
    html,
  });
};

/**
 * Send a 6-digit password reset code email
 */
export const sendPasswordResetEmail = async (to, code) => {
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background: #7C3AED; border-radius: 12px; padding: 12px 16px;">
          <span style="color: #fff; font-size: 24px; font-weight: bold;">Promodz</span>
        </div>
      </div>
      <h2 style="color: #1a1a1a; text-align: center; margin-bottom: 8px;">Reset Your Password</h2>
      <p style="color: #666; text-align: center; margin-bottom: 24px;">We received a request to reset your password. Use the code below:</p>
      <div style="background: #fef2f2; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
        <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #dc2626;">${code}</span>
      </div>
      <p style="color: #999; font-size: 13px; text-align: center;">This code expires in <strong>10 minutes</strong>. If you didn't request a password reset, you can safely ignore this email.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Promodz" <${process.env.SMTP_USER}>`,
    to,
    subject: "Promodz – Password Reset Code",
    html,
  });
};
