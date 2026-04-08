import app from './app.js';
import { startSubscriptionChecker } from './utils/subscriptionChecker.js';
import { syncCategoriesToDB } from './utils/syncCategories.js';

const PORT = process.env.PORT || 4000;

app.listen(PORT, async () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);

  // Sync categories to DB on startup (safe upsert, no data loss)
  await syncCategoriesToDB();

  // Start the daily subscription expiry checker
  startSubscriptionChecker();
});
