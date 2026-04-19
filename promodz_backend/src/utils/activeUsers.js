// src/utils/activeUsers.js
export const activeUsers = new Map(); 
// Example: { userId: { id, role, email, lastSeen } }

// Track ALL visitors (guests + authenticated) by IP address
export const activeVisitors = new Map();
// Example: { ipAddress: { lastSeen, userId (null for guests) } }

// Periodic cleanup: remove stale entries every 5 minutes (instead of per-entry timers)
const STALE_THRESHOLD_MS = 15 * 60 * 1000; // 15 minutes
setInterval(() => {
  const cutoff = Date.now() - STALE_THRESHOLD_MS;
  for (const [key, entry] of activeUsers) {
    if (entry.lastSeen && entry.lastSeen.getTime() < cutoff) {
      activeUsers.delete(key);
    }
  }
  for (const [key, entry] of activeVisitors) {
    if (entry.lastSeen && entry.lastSeen.getTime() < cutoff) {
      activeVisitors.delete(key);
    }
  }
}, 5 * 60 * 1000).unref();
