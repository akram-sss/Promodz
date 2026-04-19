// src/utils/hashIp.js
import crypto from "crypto";

/**
 * Hash an IP address for privacy-friendly storage.
 * Uses SHA-256 with a server-side salt (falls back to a static salt if env not set).
 * Returns first 16 hex chars — enough for uniqueness, not reversible.
 */
export function hashIp(ip) {
  if (!ip) return null;
  const salt = process.env.IP_HASH_SALT || "promodz-default-salt";
  return crypto.createHmac("sha256", salt).update(ip).digest("hex").slice(0, 16);
}
