"use client";

import { createLocalStore } from "./local-store";
import { DEFAULT_MEETING, type MeetingSetup } from "./mock-data";

// The mentor's fixed session room (demo: only سارا محمدی's). Kept in the
// browser until there's a backend.
const store = createLocalStore<MeetingSetup>("x-meeting", DEFAULT_MEETING);

export const useMeetingSetup = store.useValue;
export const saveMeetingSetup = store.set;
