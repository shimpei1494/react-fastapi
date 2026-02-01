import { ScrollArea, Stack } from '@mantine/core';
import { useCallback } from 'react';
import type { Message } from '../../types/chat';
import MessageItem from './MessageItem';

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  const scrollRef = useCallback((node: HTMLDivElement | null) => {
    node?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <ScrollArea flex={1}>
      <Stack gap="md" p="md">
        {messages.map((msg, i) => (
          <div key={msg.id} ref={i === messages.length - 1 ? scrollRef : undefined}>
            <MessageItem message={msg} />
          </div>
        ))}
      </Stack>
    </ScrollArea>
  );
}
