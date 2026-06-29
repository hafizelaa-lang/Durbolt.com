/**
 * Durbolt Power — Article Schedule Runner
 * Runs every Monday and Thursday at 9AM UTC via PM2 cron.
 * Generates 2 articles from CONTENT_QUEUE per run.
 * Uses Groq API (llama-3.3-70b-versatile) + Pollinations.ai (flux) for images.
 *
 * PM2 registration:
 *   pm2 start scripts/schedule-articles.mjs --name "durbolt-content" --cron "0 9 * * 1,4"
 *   pm2 save
 */

import { execSync } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

console.log(`[${new Date().toISOString()}] Durbolt Content Pipeline — starting scheduled run`);

try {
  execSync("node scripts/generate-articles.mjs", {
    cwd: ROOT,
    stdio: "inherit",
    env: { ...process.env },
  });
  console.log(`[${new Date().toISOString()}] Scheduled run complete.`);
} catch (err) {
  console.error(`[${new Date().toISOString()}] Scheduled run failed:`, err.message);
  process.exit(1);
}
