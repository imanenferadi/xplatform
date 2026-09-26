"use client";

import { useMemo } from "react";
import { createLocalStore } from "./local-store";
import { walletSeed, type WalletEntry } from "./mock-data";

// Referral credit (REFERRAL_CREDIT per friend who pays), spent at checkout.
const store = createLocalStore<typeof walletSeed>("x-wallet", walletSeed);

export function useWallet() {
  const w = store.useValue();
  return useMemo(() => {
    const earned = w.credits.reduce((s, c) => s + c.amount, 0);
    const spent = w.spends.reduce((s, c) => s + c.amount, 0);
    return { ...w, balance: earned - spent };
  }, [w]);
}

export function spendWallet(entry: Omit<WalletEntry, "id">) {
  const w = store.get();
  const balance = w.credits.reduce((s, c) => s + c.amount, 0) - w.spends.reduce((s, c) => s + c.amount, 0);
  const amount = Math.min(entry.amount, balance);
  if (amount <= 0) return 0;
  store.set({ ...w, spends: [...w.spends, { ...entry, amount, id: `ws-${Date.now()}` }] });
  return amount;
}
