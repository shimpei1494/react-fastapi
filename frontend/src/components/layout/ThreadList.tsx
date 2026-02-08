import { Button, Loader, NavLink, ScrollArea, Stack, Text, TextInput } from '@mantine/core';
import { IconPlus, IconSearch } from '@tabler/icons-react';
import { useQueryState } from 'nuqs';
import { useMemo, useState } from 'react';
import { useThreads } from '../../hooks/useThreads';

export default function ThreadList() {
  const { threads, loading } = useThreads();
  const [threadId, setThreadId] = useQueryState('threadId');
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () => threads.filter((t) => t.title.toLowerCase().includes(search.toLowerCase())),
    [threads, search],
  );

  const handleNewChat = () => {
    setThreadId(null);
  };

  return (
    <Stack
      h="100%"
      w={250}
      gap={0}
      style={{ borderRight: '1px solid var(--mantine-color-dark-4)' }}
    >
      <Stack p="sm" gap="xs">
        <Button leftSection={<IconPlus size={16} />} fullWidth onClick={handleNewChat}>
          新規チャット
        </Button>
        <TextInput
          placeholder="検索..."
          leftSection={<IconSearch size={14} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
        />
      </Stack>
      <ScrollArea flex={1}>
        {loading ? (
          <Stack align="center" py="md">
            <Loader size="sm" />
          </Stack>
        ) : (
          <>
            {filtered.map((thread) => (
              <NavLink
                key={thread.id}
                label={thread.title}
                description={thread.lastMessage}
                active={thread.id === threadId}
                onClick={() => setThreadId(thread.id)}
                styles={{
                  description: {
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  },
                }}
              />
            ))}
            {filtered.length === 0 && (
              <Text c="dimmed" ta="center" py="md" size="sm">
                スレッドが見つかりません
              </Text>
            )}
          </>
        )}
      </ScrollArea>
    </Stack>
  );
}
