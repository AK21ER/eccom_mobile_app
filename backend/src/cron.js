import https from "https";
import http from "http";

// Use the Render external URL if available, otherwise fall back to localhost
const URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 5000}`;

export const startCronJobs = () => {
  // Run every 14 minutes. Render free tier spins down after 15 minutes of inactivity.
  // We use 14 minutes instead of 1 minute to save resources while perfectly preventing sleep.
  const interval = 14 * 60 * 1000;

  setInterval(() => {
    console.log(`[Keep-Alive] Pinging server at ${URL}...`);
    
    const lib = URL.startsWith("https") ? https : http;
    
    lib.get(URL, (res) => {
      if (res.statusCode === 200) {
        console.log("[Keep-Alive] Server successfully pinged.");
      } else {
        console.error(`[Keep-Alive] Ping failed with status code: ${res.statusCode}`);
      }
    }).on("error", (err) => {
      console.error("[Keep-Alive] Error pinging server:", err.message);
    });
  }, interval);
};
