"use client";

import { useMemo } from "react";
import { createLocalStore } from "./local-store";
import { chatReadSeed, mentorMessageThreads, type ChatMessage } from "./mock-data";
import { useBroadcastMessages } from "./broadcast-store";
import { nowClock } from "./followup-store";
import type { VoiceClip } from "./use-voice-recorder";

// One thread per student, shared by both sides: what the mentor sends in
// /mentor/messages/[id] shows up in the student's /chat and back. `read`
// holds, per side, the newest message id that side has seen — which gives
// both the unread counts and the «خوانده شد» ticks.
export type Side = "mentor" | "student";
type State = { added: Record<string, ChatMessage[]>; read: Record<string, number> };

const store = createLocalStore<State>("x-chat", { added: {}, read: chatReadSeed });

const other = (side: Side): Side => (side === "mentor" ? "student" : "mentor");
const key = (studentId: string, side: Side) => `${studentId}:${side}`;

export function useThread(studentId: string): ChatMessage[] {
  const { added } = store.useValue();
  const broadcasts = useBroadcastMessages(studentId);
  return useMemo(
    () => [
      ...(mentorMessageThreads[studentId] ?? []),
      ...[...broadcasts, ...(added[studentId] ?? [])].sort((a, b) => a.id - b.id),
    ],
    [added, broadcasts, studentId]
  );
}

/** Newest message id `side` has read in this thread. */
export function useReadMark(studentId: string, side: Side): number {
  return store.useValue().read[key(studentId, side)] ?? 0;
}

export function useUnread(studentId: string, side: Side): number {
  const thread = useThread(studentId);
  const mark = useReadMark(studentId, side);
  return thread.filter((m) => m.from === other(side) && m.id > mark).length;
}

export function markRead(studentId: string, side: Side, thread: ChatMessage[]) {
  const s = store.get();
  const last = thread.reduce((mx, m) => Math.max(mx, m.id), 0);
  if ((s.read[key(studentId, side)] ?? 0) >= last) return;
  store.set({ ...s, read: { ...s.read, [key(studentId, side)]: last } });
}

export function sendMessage(studentId: string, from: Side, text: string, voice?: VoiceClip) {
  const s = store.get();
  const msg: ChatMessage = { id: Date.now(), from, text, time: `امروز ${nowClock()}`, ...(voice ? { voice } : {}) };
  // Sending also means you've read everything up to your own message.
  store.set({
    added: { ...s.added, [studentId]: [...(s.added[studentId] ?? []), msg] },
    read: { ...s.read, [key(studentId, from)]: msg.id },
  });
}

/** A blob: URL dies with the page; a data: URL survives in storage and reaches the other side. */
export async function persistVoice(clip: VoiceClip): Promise<VoiceClip> {
  const blob = await fetch(clip.url).then((r) => r.blob());
  if (blob.size > 1_500_000) return clip;
  const url = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
  return { url, seconds: clip.seconds };
}

/** Unanswered student messages per student, for the mentor's lists. */
export function useMentorUnreadCounts(): Record<string, number> {
  const { added, read } = store.useValue();
  return useMemo(() => {
    const out: Record<string, number> = {};
    const ids = new Set([...Object.keys(mentorMessageThreads), ...Object.keys(added)]);
    for (const id of ids) {
      const mark = read[key(id, "mentor")] ?? 0;
      out[id] = [...(mentorMessageThreads[id] ?? []), ...(added[id] ?? [])].filter(
        (m) => m.from === "student" && m.id > mark
      ).length;
    }
    return out;
  }, [added, read]);
}

/** Last message of a thread (seed + live), for list previews. */
export function useLastMessages(): Record<string, ChatMessage | undefined> {
  const { added } = store.useValue();
  return useMemo(() => {
    const out: Record<string, ChatMessage | undefined> = {};
    const ids = new Set([...Object.keys(mentorMessageThreads), ...Object.keys(added)]);
    for (const id of ids) {
      const live = added[id] ?? [];
      out[id] = live[live.length - 1] ?? mentorMessageThreads[id]?.[mentorMessageThreads[id].length - 1];
    }
    return out;
  }, [added]);
}
