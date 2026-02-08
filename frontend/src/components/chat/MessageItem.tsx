import { Avatar, Group, Paper } from '@mantine/core';
import { IconRobot, IconUser } from '@tabler/icons-react';
import type { Message } from '../../types/chat';
import MessageContent from './MessageContent';

interface MessageItemProps {
  message: Message;
}

export default function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === 'user';

  return (
    <Group
      align="flex-start"
      gap="sm"
      wrap="nowrap"
      style={{ flexDirection: isUser ? 'row-reverse' : 'row' }}
    >
      <Avatar color={isUser ? 'blue' : 'gray'} radius="xl" size="sm">
        {isUser ? <IconUser size={16} /> : <IconRobot size={16} />}
      </Avatar>
      <Paper bg={isUser ? 'blue.9' : 'dark.5'} maw="70%">
        <MessageContent content={message.content} />
      </Paper>
    </Group>
  );
}
