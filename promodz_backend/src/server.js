import app from './app.js';
import { startSubscriptionChecker } from './utils/subscriptionChecker.js';
import { syncCategoriesToDB } from './utils/syncCategories.js';
import dotenv from 'dotenv';
dotenv.config();

// ── Startup validation: crash early if critical env vars are missing ──
const requiredEnvVars = ['JWT_SECRET', 'REFRESH_TOKEN_SECRET', 'DATABASE_URL'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar] || process.env[envVar].length < 16) {
    console.error(`❌ FATAL: ${envVar} is missing or too short (min 16 chars). Server cannot start safely.`);
    process.exit(1);
  }
}

const PORT = process.env.PORT || 4000;

app.listen(PORT, async () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);

  // Sync categories to DB on startup (safe upsert, no data loss)
  try {
    await syncCategoriesToDB();
  } catch (err) {
    console.error('⚠️ Category sync failed on startup:', err.message);
  }

  // Start the daily subscription expiry checker
  startSubscriptionChecker();
});
