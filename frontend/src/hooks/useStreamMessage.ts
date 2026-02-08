import { useAtom, useSetAtom } from 'jotai';
import { useQueryState } from 'nuqs';
import { useCallback, useRef } from 'react';
import { messagesApi } from '../api/messages';
import { threadsApi } from '../api/threads';
import { messagesMapAtom, streamingMessageAtom, threadsAtom } from '../stores/chatAtoms';
import { errorAtom, loadingAtom } from '../stores/uiAtoms';
import type { Message } from '../types/chat';

export function useStreamMessage(threadId: string | null) {
  const [, setThreadIdQuery] = useQueryState('threadId');
  const setMessagesMap = useSetAtom(messagesMapAtom);
  const [streamingMessage, setStreamingMessage] = useAtom(streamingMessageAtom);
  const setThreads = useSetAtom(threadsAtom);
  const setLoading = useSetAtom(loadingAtom);
  const setError = useSetAtom(errorAtom);

  // 作成したスレッドIDを保持（送信中に参照するため）
  const createdThreadIdRef = useRef<string | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      setLoading((prev) => ({ ...prev, sending: true }));
      setError((prev) => ({ ...prev, sending: null }));

      let currentThreadId: string;

      try {
        // 新規チャットの場合、スレッドを作成
        if (!threadId) {
          const data = await threadsApi.create('新しいチャット');
          currentThreadId = data.id;
          createdThreadIdRef.current = currentThreadId;

          // スレッド一覧に追加
          setThreads((prev) => [
            {
              id: data.id,
              title: data.title,
              lastMessage: data.lastMessage,
              timestamp: new Date(data.timestamp),
            },
            ...prev,
          ]);

          // URLを更新
          await setThreadIdQuery(currentThreadId);

          // バックグラウンドでタイトル生成
          const threadIdForTitle = currentThreadId;
          threadsApi.generateTitle(threadIdForTitle, content).then((res) => {
            setThreads((prev) =>
              prev.map((t) => (t.id === threadIdForTitle ? { ...t, title: res.title } : t)),
            );
          });
        } else {
          currentThreadId = threadId;
        }

        const userMessage: Message = {
          id: `temp-${Date.now()}`,
          threadId: currentThreadId,
          role: 'user',
          content,
          timestamp: new Date(),
        };

        setMessagesMap((prev) => {
          const newMap = new Map(prev);
          const existing = newMap.get(currentThreadId) ?? [];
          newMap.set(currentThreadId, [...existing, userMessage]);
          return newMap;
        });

        setStreamingMessage({ threadId: currentThreadId, content: '' });

        let fullResponse = '';

        for await (const chunk of messagesApi.streamResponse(currentThreadId, content)) {
          fullResponse += chunk;
          setStreamingMessage({ threadId: currentThreadId, content: fullResponse });
        }

        const assistantMessage: Message = {
          id: `msg-${Date.now()}`,
          threadId: currentThreadId,
          role: 'assistant',
          content: fullResponse,
          timestamp: new Date(),
        };

        setMessagesMap((prev) => {
          const newMap = new Map(prev);
          const existing = newMap.get(currentThreadId) ?? [];
          newMap.set(currentThreadId, [...existing, assistantMessage]);
          return newMap;
        });

        setThreads((prev) =>
          prev.map((t) =>
            t.id === currentThreadId ? { ...t, lastMessage: content, timestamp: new Date() } : t,
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
        createdThreadIdRef.current = null;
      }
    },
    [
      threadId,
      setThreadIdQuery,
      setMessagesMap,
      setStreamingMessage,
      setThreads,
      setLoading,
      setError,
    ],
  );

  // streamingの判定では作成中のスレッドIDも考慮
  const effectiveThreadId = threadId ?? createdThreadIdRef.current;

  return {
    sendMessage,
    isStreaming: streamingMessage?.threadId === effectiveThreadId,
  };
}
