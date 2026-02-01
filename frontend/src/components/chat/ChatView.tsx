import { Stack, Text, Title } from '@mantine/core';
import { IconMessage } from '@tabler/icons-react';
import { useAtom, useSetAtom } from 'jotai';
import { useMemo } from 'react';
import { addMessageAtom, allMessagesAtom, threadsAtom } from '../../stores/chatAtoms';
import MessageInput from './MessageInput';
import MessageList from './MessageList';

interface ChatViewProps {
  threadId: string | null;
}

export default function ChatView({ threadId }: ChatViewProps) {
  const [allMessages] = useAtom(allMessagesAtom);
  const [threads] = useAtom(threadsAtom);
  const addMessage = useSetAtom(addMessageAtom);

  const messages = useMemo(
    () => allMessages.filter((m) => m.threadId === threadId),
    [allMessages, threadId],
  );

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
    addMessage({ threadId, content });
  };

  return (
    <Stack flex={1} h="100%" gap={0}>
      <Title order={4} p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
        {currentThread?.title ?? 'チャット'}
      </Title>
      <MessageList messages={messages} />
      <MessageInput onSend={handleSend} />
    </Stack>
  );
}
