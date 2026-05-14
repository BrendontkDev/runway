import { transactions } from "./finance.store.js";
import type { Transaction } from "./finance.types.js";

export function createTransaction(
  data: Omit<Transaction, "id" | "createdAt">
) {
  const transaction: Transaction = {
    id: crypto.randomUUID(),
    createdAt: new Date(),
    ...data,
  };

  transactions.push(transaction);

  return transaction;
}

export function listTransactions() {
  return transactions;
}

export function getCashBalance() {
  let balance = 0;

  for (const t of transactions) {
    if (t.type === "INCOME") {
      balance += t.amount;
    } else {
      balance -= t.amount;
    }
  }

  return balance;
}

export function getBurnRate() {
  let expenses = 0;

  for (const t of transactions) {
    if (t.type === "EXPENSE") {
      expenses += t.amount;
    }
  }

  return expenses;
}

export function getNetProfit() {
  let income = 0;
  let expense = 0;

  for (const t of transactions) {
    if (t.type === "INCOME") {
      income += t.amount;
    } else {
      expense += t.amount;
    }
  }

  return income - expense;
}

export function getRunway() {
  const cash = getCashBalance();
  const burn = getBurnRate();

  if (burn <= 0) {
    return null;
  }

  return Number((cash / burn).toFixed(1));
}

export function getFinanceKPIs() {
  return {
    cash: getCashBalance(),
    burnRate: getBurnRate(),
    runway: getRunway(),
    netProfit: getNetProfit(),
  };
}
