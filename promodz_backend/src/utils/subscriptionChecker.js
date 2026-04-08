import { prisma } from "./prisma.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// ── SMTP transporter (reuse same config as email.js) ──
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ── Constants ──
const WARNING_DAYS = 3; // Start warning when <= 3 days remain
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Build an HTML email for subscription expiry warning.
 */
function buildEmailHtml({ companyName, companyEmail, planName, endDate, daysLeft }) {
  const isExpired = daysLeft < 0;
  const statusColor = isExpired ? "#dc2626" : daysLeft <= 1 ? "#ea580c" : "#d97706";
  const statusText = isExpired
    ? `Expired ${Math.abs(daysLeft)} day(s) ago`
    : daysLeft < 1
      ? "Expires TODAY"
      : `Expires in ${daysLeft} day(s)`;

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background: #7C3AED; border-radius: 12px; padding: 12px 16px;">
          <span style="color: #fff; font-size: 24px; font-weight: bold;">Promodz</span>
        </div>
      </div>
      <h2 style="color: #1a1a1a; text-align: center; margin-bottom: 8px;">Subscription Alert</h2>
      <p style="color: #666; text-align: center; margin-bottom: 24px;">
        The subscription for <strong>${companyName}</strong> requires attention.
      </p>
      <div style="background: #faf5ff; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #374151;">
          <tr>
            <td style="padding: 8px 0; font-weight: 600;">Company:</td>
            <td style="padding: 8px 0;">${companyName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 600;">Email:</td>
            <td style="padding: 8px 0;">${companyEmail}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 600;">Plan:</td>
            <td style="padding: 8px 0;">${planName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 600;">End Date:</td>
            <td style="padding: 8px 0;">${new Date(endDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 600;">Status:</td>
            <td style="padding: 8px 0;">
              <span style="color: ${statusColor}; font-weight: 700;">${statusText}</span>
            </td>
          </tr>
        </table>
      </div>
      <p style="color: #6b7280; font-size: 13px; text-align: center;">
        ${isExpired
          ? "This subscription has expired. Please renew to continue accessing premium features."
          : "Please renew the subscription before it expires to avoid service interruption."
        }
      </p>
      <p style="color: #9ca3af; font-size: 11px; text-align: center; margin-top: 16px;">
        This is an automated daily reminder from Promodz.
      </p>
    </div>
  `;
}

/**
 * Send the warning email to a list of recipients.
 */
async function sendWarningEmail(recipients, emailData) {
  const html = buildEmailHtml(emailData);
  const { daysLeft, companyName } = emailData;

  const isExpired = daysLeft < 0;
  const subject = isExpired
    ? `⚠️ Subscription EXPIRED – ${companyName} (${Math.abs(daysLeft)}d overdue)`
    : daysLeft < 1
      ? `🔴 Subscription expires TODAY – ${companyName}`
      : `⚠️ Subscription expiring in ${daysLeft} day(s) – ${companyName}`;

  for (const to of recipients) {
    try {
      await transporter.sendMail({
        from: `"Promodz Alerts" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
      });
    } catch (err) {
      console.error(`  ✉️ Failed to send to ${to}:`, err.message);
    }
  }
}

/**
 * Core check: query all subscriptions that are within the warning window
 * (endDate - now <= 3 days, including already-expired ones).
 */
export async function checkSubscriptions() {
  console.log(`\n🔍 [SubscriptionChecker] Running at ${new Date().toISOString()}`);

  try {
    // 1. Fetch all non-cancelled subscriptions with their company info
    const subscriptions = await prisma.subscription.findMany({
      where: {
        status: { not: "CANCELLED" },
      },
      include: {
        company: {
          select: {
            id: true,
            email: true,
            fullName: true,
            companyName: true,
            username: true,
          },
        },
      },
    });

    // 2. Get all super-admins
    const superAdmins = await prisma.user.findMany({
      where: { role: "SUPER_ADMIN" },
      select: { email: true },
    });
    const adminEmails = superAdmins.map((a) => a.email).filter(Boolean);

    if (adminEmails.length === 0) {
      console.warn("  ⚠️ No SUPER_ADMIN emails found — skipping admin notifications.");
    }

    const now = new Date();
    let warned = 0;

    for (const sub of subscriptions) {
      const endDate = new Date(sub.endDate);
      const diffMs = endDate.getTime() - now.getTime();
      const daysLeft = Math.ceil(diffMs / MS_PER_DAY);

      // Only warn if <= WARNING_DAYS remaining (includes negative = already expired)
      if (daysLeft > WARNING_DAYS) continue;

      const companyName =
        sub.company?.companyName || sub.company?.fullName || sub.company?.username || "Unknown";
      const companyEmail = sub.company?.email;

      console.log(
        `  📋 ${companyName} — plan: ${sub.plan}, ends: ${endDate.toISOString().slice(0, 10)}, days left: ${daysLeft}`
      );

      // Build recipient list: all super-admins + the company itself
      const recipients = [...adminEmails];
      if (companyEmail && !recipients.includes(companyEmail)) {
        recipients.push(companyEmail);
      }

      if (recipients.length === 0) continue;

      await sendWarningEmail(recipients, {
        companyName,
        companyEmail: companyEmail || "N/A",
        planName: sub.plan,
        endDate: sub.endDate,
        daysLeft,
      });

      warned++;
    }

    console.log(
      `✅ [SubscriptionChecker] Done — ${subscriptions.length} subscriptions checked, ${warned} warning(s) sent.\n`
    );
  } catch (error) {
    console.error("❌ [SubscriptionChecker] Error:", error);
  }
}

/**
 * Calculate milliseconds until next midnight (00:00:00).
 */
function msUntilMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0); // next midnight
  return midnight.getTime() - now.getTime();
}

/**
 * Start the subscription checker.
 * Runs once immediately on startup, then every midnight.
 */
export function startSubscriptionChecker() {
  console.log("⏰ [SubscriptionChecker] Scheduler started");

  // Run once on startup
  checkSubscriptions();

  // Schedule first run at next midnight, then every 24h
  const msToMidnight = msUntilMidnight();
  const hours = Math.floor(msToMidnight / 3600000);
  const mins = Math.floor((msToMidnight % 3600000) / 60000);
  console.log(`⏰ [SubscriptionChecker] Next run at midnight (in ${hours}h ${mins}m)`);

  setTimeout(() => {
    checkSubscriptions();

    // Then repeat every 24 hours
    setInterval(checkSubscriptions, 24 * 60 * 60 * 1000);
  }, msToMidnight);
}
