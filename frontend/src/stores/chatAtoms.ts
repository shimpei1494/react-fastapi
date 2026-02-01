import { atom } from 'jotai';
import { mockMessages, mockThreads } from '../data/mockData';
import type { Message, Thread } from '../types/chat';

export const threadsAtom = atom<Thread[]>(mockThreads);
export const allMessagesAtom = atom<Message[]>(mockMessages);

let nextMessageId = mockMessages.length + 1;
let nextThreadId = mockThreads.length + 1;

export const addMessageAtom = atom(
  null,
  (get, set, { threadId, content }: { threadId: string; content: string }) => {
    const userMessage: Message = {
      id: `m${nextMessageId++}`,
      threadId,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    const assistantMessage: Message = {
      id: `m${nextMessageId++}`,
      threadId,
      role: 'assistant',
      content: `「${content}」についてですね。これはモックの返答です。`,
      timestamp: new Date(),
    };

    set(allMessagesAtom, [...get(allMessagesAtom), userMessage, assistantMessage]);

    // スレッドの lastMessage を更新
    set(
      threadsAtom,
      get(threadsAtom).map((t) =>
        t.id === threadId ? { ...t, lastMessage: content, timestamp: new Date() } : t,
      ),
    );
  },
);

export const createThreadAtom = atom(null, (get, set) => {
  const newThread: Thread = {
    id: `t${nextThreadId++}`,
    title: '新しいチャット',
    lastMessage: '',
    timestamp: new Date(),
  };

  set(threadsAtom, [newThread, ...get(threadsAtom)]);

  return newThread.id;
});
