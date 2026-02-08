import { useAtom, useSetAtom } from 'jotai';
import { useCallback, useEffect } from 'react';
import { messagesApi } from '../api/messages';
import { messagesMapAtom } from '../stores/chatAtoms';
import { errorAtom, loadingAtom } from '../stores/uiAtoms';

export function useMessages(threadId: string | null) {
  const [messagesMap, setMessagesMap] = useAtom(messagesMapAtom);
  const [loading, setLoading] = useAtom(loadingAtom);
  const setError = useSetAtom(errorAtom);

  const fetchMessages = useCallback(async () => {
    if (!threadId) return;

    if (messagesMap.has(threadId)) return;

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
      setError((prev) => ({
        ...prev,
        messages: e instanceof Error ? e.message : 'メッセージの取得に失敗しました',
      }));
    } finally {
      setLoading((prev) => ({ ...prev, messages: false }));
    }
  }, [threadId, messagesMap, setMessagesMap, setLoading, setError]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return {
    messages: messagesMap.get(threadId ?? '') ?? [],
    loading: loading.messages,
  };
}
