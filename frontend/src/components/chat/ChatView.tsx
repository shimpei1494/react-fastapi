import { Loader, Stack, Text, Title } from '@mantine/core';
import { IconMessage } from '@tabler/icons-react';
import { useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { useMessages } from '../../hooks/useMessages';
import { useStreamMessage } from '../../hooks/useStreamMessage';
import { messagesMapAtom, streamingMessageAtom, threadsAtom } from '../../stores/chatAtoms';
import MessageInput from './MessageInput';
import MessageList from './MessageList';

interface ChatViewProps {
  threadId: string | null;
}

export default function ChatView({ threadId }: ChatViewProps) {
  const threads = useAtomValue(threadsAtom);
  const messagesMap = useAtomValue(messagesMapAtom);
  const streaming = useAtomValue(streamingMessageAtom);
  const { loading } = useMessages(threadId);
  const { sendMessage, isStreaming } = useStreamMessage(threadId);

  const messages = useMemo(() => {
    const base = (threadId ? messagesMap.get(threadId) : undefined) ?? [];
    if (streaming?.threadId === threadId && streaming.content) {
      return [
        ...base,
        {
          id: 'streaming',
          threadId: threadId,
          role: 'assistant' as const,
          content: streaming.content,
          timestamp: new Date(),
        },
      ];
    }
    return base;
  }, [messagesMap, streaming, threadId]);

  const currentThread = useMemo(() => threads.find((t) => t.id === threadId), [threads, threadId]);

  const handleSend = (content: string) => {
    sendMessage(content);
  };

  // 新規チャット画面（threadId が null の場合）
  if (!threadId) {
    return (
      <Stack flex={1} h="100%" gap={0}>
        <Title order={4} p="md" style={{ borderBottom: '1px solid var(--mantine-color-dark-4)' }}>
          新規チャット
        </Title>
        <Stack flex={1} align="center" justify="center" gap="md">
          <IconMessage size={48} color="var(--mantine-color-gray-4)" />
          <Text c="dimmed" size="lg">
            メッセージを入力してください
          </Text>
        </Stack>
        <MessageInput onSend={handleSend} disabled={isStreaming} />
      </Stack>
    );
  }

  return (
    <Stack flex={1} h="100%" gap={0}>
      <Title order={4} p="md" style={{ borderBottom: '1px solid var(--mantine-color-dark-4)' }}>
        {currentThread?.title ?? 'チャット'}
      </Title>
      {loading ? (
        <Stack flex={1} align="center" justify="center">
          <Loader size="md" />
        </Stack>
      ) : (
        <MessageList messages={messages} />
      )}
      <MessageInput onSend={handleSend} disabled={isStreaming} />
    </Stack>
  );
}
