import fastify from "fastify";
import { financeRoutes } from "./modules/finance/finance.routes.js";

export const app = fastify({
  logger: true,
});

app.get("/health", async () => {
  return {
    status: "ok",
    service: "runway-api",
    timestamp: new Date().toISOString(),
  };
});

app.register(financeRoutes);
