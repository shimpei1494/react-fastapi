import { ActionIcon, Group, Textarea } from '@mantine/core';
import { IconSend } from '@tabler/icons-react';
import { type KeyboardEvent, useState } from 'react';

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export default function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [value, setValue] = useState('');

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Group p="md" gap="sm" align="flex-end" wrap="nowrap">
      <Textarea
        flex={1}
        placeholder="メッセージを入力..."
        value={value}
        onChange={(e) => setValue(e.currentTarget.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />
      <ActionIcon
        size="lg"
        color="blue"
        variant="filled"
        onClick={handleSend}
        disabled={disabled || !value.trim()}
      >
        <IconSend size={18} />
      </ActionIcon>
    </Group>
  );
}
