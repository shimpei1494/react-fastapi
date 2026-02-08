import { useAtom, useSetAtom } from 'jotai';
import { useCallback, useEffect } from 'react';
import { threadsApi } from '../api/threads';
import { threadsAtom } from '../stores/chatAtoms';
import { errorAtom, loadingAtom } from '../stores/uiAtoms';

export function useThreads() {
  const [threads, setThreads] = useAtom(threadsAtom);
  const [loading, setLoading] = useAtom(loadingAtom);
  const setError = useSetAtom(errorAtom);

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

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  return {
    threads,
    loading: loading.threads,
    createThread,
    refetch: fetchThreads,
  };
}
