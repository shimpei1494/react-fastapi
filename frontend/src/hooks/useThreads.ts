import { useAtom, useSetAtom } from 'jotai';
import { useCallback, useEffect } from 'react';
import { threadsApi } from '../api/threads';
import { messagesMapAtom, threadsAtom } from '../stores/chatAtoms';
import { errorAtom, loadingAtom } from '../stores/uiAtoms';

export function useThreads() {
  const [threads, setThreads] = useAtom(threadsAtom);
  const [loading, setLoading] = useAtom(loadingAtom);
  const setError = useSetAtom(errorAtom);
  const setMessagesMap = useSetAtom(messagesMapAtom);

  const fetchThreads = useCallback(async () => {
    setLoading((prev) => ({ ...prev, threads: true }));
    setError((prev) => ({ ...prev, threads: null }));

    try {
      const data = await threadsApi.getAll();
      setThreads(
        data.map((t) => ({
          id: t.id,
          title: t.title,
          lastMessage: t.lastMessage,
          timestamp: new Date(t.timestamp),
        })),
      );
    } catch (e) {
      setError((prev) => ({
        ...prev,
        threads: e instanceof Error ? e.message : '取得に失敗しました',
      }));
    } finally {
      setLoading((prev) => ({ ...prev, threads: false }));
    }
  }, [setThreads, setLoading, setError]);

  const createThread = useCallback(
    async (title = '新しいチャット') => {
      const data = await threadsApi.create(title);
      const newThread = {
        id: data.id,
        title: data.title,
        lastMessage: data.lastMessage,
        timestamp: new Date(data.timestamp),
      };
      setThreads((prev) => [newThread, ...prev]);
      return data.id;
    },
    [setThreads],
  );

  const updateThread = useCallback(
    async (threadId: string, newTitle: string) => {
      const data = await threadsApi.update(threadId, newTitle);
      setThreads((prev) =>
        prev.map((t) =>
          t.id === threadId ? { ...t, title: data.title, timestamp: new Date(data.timestamp) } : t,
        ),
      );
    },
    [setThreads],
  );

  const deleteThread = useCallback(
    async (threadId: string) => {
      await threadsApi.delete(threadId);
      setThreads((prev) => prev.filter((t) => t.id !== threadId));
      setMessagesMap((prev) => {
        const newMap = new Map(prev);
        newMap.delete(threadId);
        return newMap;
      });
    },
    [setThreads, setMessagesMap],
  );

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  return {
    threads,
    loading: loading.threads,
    createThread,
    updateThread,
    deleteThread,
    refetch: fetchThreads,
  };
}
