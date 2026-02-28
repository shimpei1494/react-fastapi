import { atom } from 'jotai';
import type { Message, StreamingMessage, Thread } from '../types/chat';

// === データatom ===
export const threadsAtom = atom<Thread[]>([]);
export const messagesMapAtom = atom<Map<string, Message[]>>(new Map());
export const streamingMessageAtom = atom<StreamingMessage | null>(null);
