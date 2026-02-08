import { useAtom, useSetAtom } from 'jotai';
import { useCallback } from 'react';
import { messagesApi } from '../api/messages';
import { messagesMapAtom, streamingMessageAtom, threadsAtom } from '../stores/chatAtoms';
import { errorAtom, loadingAtom } from '../stores/uiAtoms';
import type { Message } from '../types/chat';

export function useStreamMessage(threadId: string) {
  const setMessagesMap = useSetAtom(messagesMapAtom);
  const [streamingMessage, setStreamingMessage] = useAtom(streamingMessageAtom);
  const setThreads = useSetAtom(threadsAtom);
  const setLoading = useSetAtom(loadingAtom);
  const setError = useSetAtom(errorAtom);

  const sendMessage = useCallback(
    async (content: string) => {
      setLoading((prev) => ({ ...prev, sending: true }));
      setError((prev) => ({ ...prev, sending: null }));

      const userMessage: Message = {
        id: `temp-${Date.now()}`,
        threadId,
        role: 'user',
        content,
        timestamp: new Date(),
      };

      setMessagesMap((prev) => {
        const newMap = new Map(prev);
        const existing = newMap.get(threadId) ?? [];
        newMap.set(threadId, [...existing, userMessage]);
        return newMap;
      });

      setStreamingMessage({ threadId, content: '' });

      try {
        let fullResponse = '';

        for await (const chunk of messagesApi.streamResponse(threadId, content)) {
          fullResponse += chunk;
          setStreamingMessage({ threadId, content: fullResponse });
        }

        const assistantMessage: Message = {
          id: `msg-${Date.now()}`,
          threadId,
          role: 'assistant',
          content: fullResponse,
          timestamp: new Date(),
        };

        setMessagesMap((prev) => {
          const newMap = new Map(prev);
          const existing = newMap.get(threadId) ?? [];
          newMap.set(threadId, [...existing, assistantMessage]);
          return newMap;
        });

        setThreads((prev) =>
          prev.map((t) =>
            t.id === threadId ? { ...t, lastMessage: content, timestamp: new Date() } : t,
          ),
        );
      } catch (e) {
        setError((prev) => ({
          ...prev,
          sending: e instanceof Error ? e.message : '送信に失敗しました',
        }));
      } finally {
        setStreamingMessage(null);
        setLoading((prev) => ({ ...prev, sending: false }));
      }
    },
    [threadId, setMessagesMap, setStreamingMessage, setThreads, setLoading, setError],
  );

  return {
    sendMessage,
    isStreaming: streamingMessage?.threadId === threadId,
  };
}
