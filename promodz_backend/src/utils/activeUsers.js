// src/utils/activeUsers.js
export const activeUsers = new Map(); 
// Example: { userId: { id, role, email, lastSeen } }

// Track ALL visitors (guests + authenticated) by IP address
export const activeVisitors = new Map();
// Example: { ipAddress: { lastSeen, userId (null for guests) } }
