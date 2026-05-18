import fastify from "fastify";
import cors from "@fastify/cors";
import { financeRoutes } from "./modules/finance/finance.routes.js";

export const app = fastify({
  logger: true,
});

await app.register(cors, {
  origin: "*",
});

app.get("/health", async () => {
  return {
    status: "ok",
    service: "runway-api",
    timestamp: new Date().toISOString(),
  };
});

app.register(financeRoutes);
