import fastify from "fastify";

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
