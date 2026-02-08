import { atom } from 'jotai';
import type { Message, StreamingMessage, Thread } from '../types/chat';

// === データatom ===
export const threadsAtom = atom<Thread[]>([]);
export const messagesMapAtom = atom<Map<string, Message[]>>(new Map());
export const streamingMessageAtom = atom<StreamingMessage | null>(null);
export const selectedThreadIdAtom = atom<string | null>(null);

// === 派生atom ===
export const currentMessagesAtom = atom((get) => {
  const threadId = get(selectedThreadIdAtom);
  if (!threadId) return [];

  const messages = get(messagesMapAtom).get(threadId) ?? [];
  const streaming = get(streamingMessageAtom);

  if (streaming?.threadId === threadId && streaming.content) {
    return [
      ...messages,
      {
        id: 'streaming',
        threadId,
        role: 'assistant' as const,
        content: streaming.content,
        timestamp: new Date(),
      },
    ];
  }

  return messages;
});
