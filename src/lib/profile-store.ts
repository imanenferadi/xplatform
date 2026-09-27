"use client";

import { createLocalStore } from "./local-store";
import { studentProfile } from "./mock-data";

// ایمان's editable personal info (name shown in the greeting and the menu).
type Profile = { name: string; city: string };
const store = createLocalStore<Profile>("x-profile", { name: studentProfile.name, city: studentProfile.city });

export const useProfile = store.useValue;
export const saveProfile = store.set;
