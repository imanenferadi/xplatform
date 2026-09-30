"use client";

import { createLocalStore } from "./local-store";

// Placement is optional: the dashboard offers it until it's been taken once.
const store = createLocalStore<{ done: boolean }>("x-placement", {
  done: false,
});

export const usePlacementDone = () => store.useValue().done;
export function markPlacementDone() {
  store.set({ done: true });
}
