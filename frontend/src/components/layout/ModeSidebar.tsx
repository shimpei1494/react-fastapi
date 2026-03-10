import { ActionIcon, Stack, Tooltip, useMantineTheme } from '@mantine/core';
import { IconFlask, IconMessage, IconSearch, IconSettings } from '@tabler/icons-react';
import { NavLink, useLocation } from 'react-router-dom';

const modes = [
  { path: '/chat', label: 'チャット', icon: IconMessage },
  { path: '/search', label: '検索', icon: IconSearch },
  { path: '/settings', label: '設定', icon: IconSettings },
  { path: '/playground', label: 'Playground', icon: IconFlask },
] as const;

export default function ModeSidebar() {
  const location = useLocation();
  const theme = useMantineTheme();

  return (
    <Stack h="100%" w={60} align="center" gap="xs" py="md" bg={theme.colors.dark[7]}>
      {modes.map(({ path, label, icon: Icon }) => (
        <Tooltip key={path} label={label} position="right">
          <ActionIcon
            component={NavLink}
            to={path}
            size="lg"
            color={location.pathname === path ? 'blue' : 'gray'}
            variant={location.pathname === path ? 'light' : 'subtle'}
          >
            <Icon size={20} />
          </ActionIcon>
        </Tooltip>
      ))}
    </Stack>
  );
}
