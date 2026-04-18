import { useAtom, useSetAtom } from 'jotai';
import { useCallback, useEffect, useRef } from 'react';
import { ApiError } from '../api/client';
import { messagesApi } from '../api/messages';
import { messagesMapAtom } from '../stores/chatAtoms';
import { errorAtom, loadingAtom, threadNotFoundAtom } from '../stores/uiAtoms';

export function useMessages(threadId: string | null) {
  const [messagesMap, setMessagesMap] = useAtom(messagesMapAtom);
  // fetchMessages の依存配列から messagesMap を外すため、最新値を ref で保持する
  const messagesMapRef = useRef(messagesMap);
  messagesMapRef.current = messagesMap;

  const [loading, setLoading] = useAtom(loadingAtom);
  const setError = useSetAtom(errorAtom);
  const setThreadNotFound = useSetAtom(threadNotFoundAtom);

  const fetchMessages = useCallback(async () => {
    if (!threadId) return;

    // threadId が変わるたびにスレッド未発見フラグをリセット
    setThreadNotFound(false);

    if (messagesMapRef.current.has(threadId)) return;

    setLoading((prev) => ({ ...prev, messages: true }));
    setError((prev) => ({ ...prev, messages: null }));

    try {
      const data = await messagesApi.getByThread(threadId);
      const messages = data.map((m) => ({
        id: m.id,
        threadId: m.threadId,
        role: m.role,
        content: m.content,
        timestamp: new Date(m.timestamp),
      }));

      setMessagesMap((prev) => new Map(prev).set(threadId, messages));
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        setThreadNotFound(true);
      } else {
        setError((prev) => ({
          ...prev,
          messages: e instanceof Error ? e.message : 'メッセージの取得に失敗しました',
        }));
      }
    } finally {
      setLoading((prev) => ({ ...prev, messages: false }));
    }
  }, [threadId, setMessagesMap, setLoading, setError, setThreadNotFound]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return {
    messages: messagesMap.get(threadId ?? '') ?? [],
    loading: loading.messages,
  };
}
