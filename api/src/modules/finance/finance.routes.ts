import type { FastifyInstance } from "fastify";


import {
  createTransaction,
  listTransactions,
  getBurnRate,
  getRunway,
  getNetProfit,
  getFinanceKPIs,
} from "./finance.service.js";

export async function financeRoutes(app: FastifyInstance) {
  // GET /transactions
  app.get("/transactions", async () => {
    return listTransactions();
  });

  // POST /transactions
  app.post("/transactions", async (request) => {
    const body = request.body as {
      type: "INCOME" | "EXPENSE";
      amount: number;
      description?: string;
    };

    return createTransaction(body);
  });

  // GET /finance/burn
  app.get("/finance/burn", async () => {
    return {
      burnRate: getBurnRate(),
    };
  });

  // GET /finance/runway
  app.get("/finance/runway", async () => {
    return {
      runway: getRunway(),
    };
  });

  // GET /finance/profit
  app.get("/finance/profit", async () => {
    return {
      netProfit: getNetProfit(),
    };
  });

  // GET /finance/kpis
  app.get("/finance/kpis", async () => {
    return getFinanceKPIs();
  });
}
