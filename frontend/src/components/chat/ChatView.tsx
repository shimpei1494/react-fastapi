import { Loader, Stack, Text, Title } from '@mantine/core';
import { IconMessage } from '@tabler/icons-react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useMemo } from 'react';
import { useMessages } from '../../hooks/useMessages';
import { useStreamMessage } from '../../hooks/useStreamMessage';
import { currentMessagesAtom, selectedThreadIdAtom, threadsAtom } from '../../stores/chatAtoms';
import MessageInput from './MessageInput';
import MessageList from './MessageList';

interface ChatViewProps {
  threadId: string | null;
}

export default function ChatView({ threadId }: ChatViewProps) {
  const setSelectedThreadId = useSetAtom(selectedThreadIdAtom);
  const [threads] = useAtom(threadsAtom);
  const messages = useAtomValue(currentMessagesAtom);
  const { loading } = useMessages(threadId);
  const { sendMessage, isStreaming } = useStreamMessage(threadId ?? '');

  useEffect(() => {
    setSelectedThreadId(threadId);
  }, [threadId, setSelectedThreadId]);

  const currentThread = useMemo(() => threads.find((t) => t.id === threadId), [threads, threadId]);

  if (!threadId) {
    return (
      <Stack flex={1} align="center" justify="center" gap="md">
        <IconMessage size={48} color="var(--mantine-color-gray-4)" />
        <Text c="dimmed" size="lg">
          スレッドを選択してください
        </Text>
      </Stack>
    );
  }

  const handleSend = (content: string) => {
    sendMessage(content);
  };

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
