import { app } from "./app.js";

const PORT = Number(process.env.PORT) || 3001;
const HOST = "0.0.0.0";

async function start() {
  try {
    await app.listen({ port: PORT, host: HOST });
    console.log(`🚀 Runway API running on http://localhost:${PORT}`);
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

start();
