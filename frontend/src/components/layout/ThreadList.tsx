import {
  ActionIcon,
  Button,
  Loader,
  Menu,
  NavLink,
  ScrollArea,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { IconDots, IconPencil, IconPlus, IconSearch } from '@tabler/icons-react';
import { useQueryState } from 'nuqs';
import { useMemo, useState } from 'react';
import { useThreads } from '../../hooks/useThreads';
import type { Thread } from '../../types/chat';

export default function ThreadList() {
  const { threads, loading, updateThread } = useThreads();
  const [threadId, setThreadId] = useQueryState('threadId');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const filtered = useMemo(
    () => threads.filter((t) => t.title.toLowerCase().includes(search.toLowerCase())),
    [threads, search],
  );

  const handleNewChat = () => {
    setThreadId(null);
  };

  const handleEditStart = (thread: Thread) => {
    setEditingId(thread.id);
    setEditValue(thread.title);
  };

  const handleEditSubmit = async (id: string) => {
    if (editValue.trim()) {
      await updateThread(id, editValue.trim());
    }
    setEditingId(null);
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
            {filtered.map((thread) =>
              editingId === thread.id ? (
                <TextInput
                  key={thread.id}
                  value={editValue}
                  onChange={(e) => setEditValue(e.currentTarget.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleEditSubmit(thread.id);
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  onBlur={() => handleEditSubmit(thread.id)}
                  autoFocus
                  mx="xs"
                  my={4}
                />
              ) : (
                <NavLink
                  key={thread.id}
                  label={thread.title}
                  description={thread.lastMessage}
                  active={thread.id === threadId}
                  onClick={() => setThreadId(thread.id)}
                  rightSection={
                    <Menu position="bottom-end" withinPortal>
                      <Menu.Target>
                        <ActionIcon variant="subtle" size="sm" onClick={(e) => e.stopPropagation()}>
                          <IconDots size={14} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item
                          leftSection={<IconPencil size={14} />}
                          onClick={() => handleEditStart(thread)}
                        >
                          名前を変更
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  }
                  styles={{
                    description: {
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    },
                  }}
                />
              ),
            )}
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
