import { Flex } from '@mantine/core';
import { useQueryState } from 'nuqs';
import ChatView from '../components/chat/ChatView';
import ThreadList from '../components/layout/ThreadList';

export default function ChatPage() {
  const [threadId] = useQueryState('threadId');

  return (
    <Flex h="100%" flex={1}>
      <ThreadList />
      <ChatView threadId={threadId} />
    </Flex>
  );
}
