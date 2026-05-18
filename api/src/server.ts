import { app } from "./app.js";

const PORT = Number(process.env.PORT) || 3001;
const HOST = "0.0.0.0";

async function start() {
  try {
    await app.listen({ port: PORT, host: HOST });
    console.log(`🚀 Runway API running on ${PORT}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

start();
