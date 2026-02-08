import { CodeHighlight } from '@mantine/code-highlight';
import { Anchor, Blockquote, Code, List, Table, Text, Title } from '@mantine/core';
import type { Components } from 'react-markdown';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageContentProps {
  content: string;
}

const components: Components = {
  h1: ({ children }) => (
    <Title order={1} my="sm">
      {children}
    </Title>
  ),
  h2: ({ children }) => (
    <Title order={2} my="sm">
      {children}
    </Title>
  ),
  h3: ({ children }) => (
    <Title order={3} my="sm">
      {children}
    </Title>
  ),
  h4: ({ children }) => (
    <Title order={4} my="xs">
      {children}
    </Title>
  ),
  h5: ({ children }) => (
    <Title order={5} my="xs">
      {children}
    </Title>
  ),
  h6: ({ children }) => (
    <Title order={6} my="xs">
      {children}
    </Title>
  ),

  p: ({ children }) => (
    <Text size="sm" my="xs">
      {children}
    </Text>
  ),

  code: ({ className, children }) => {
    const match = /language-(\w+)/.exec(className || '');
    const isInline = !match && !className;

    if (isInline) {
      return <Code>{children}</Code>;
    }

    return (
      <CodeHighlight
        code={String(children).replace(/\n$/, '')}
        language={match?.[1] ?? 'text'}
        my="xs"
      />
    );
  },

  pre: ({ children }) => <>{children}</>,

  a: ({ href, children }) => (
    <Anchor href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </Anchor>
  ),

  ul: ({ children }) => (
    <List size="sm" my="xs">
      {children}
    </List>
  ),
  ol: ({ children }) => (
    <List type="ordered" size="sm" my="xs">
      {children}
    </List>
  ),
  li: ({ children }) => <List.Item>{children}</List.Item>,

  blockquote: ({ children }) => <Blockquote my="xs">{children}</Blockquote>,

  table: ({ children }) => (
    <Table striped highlightOnHover my="xs">
      {children}
    </Table>
  ),
  thead: ({ children }) => <Table.Thead>{children}</Table.Thead>,
  tbody: ({ children }) => <Table.Tbody>{children}</Table.Tbody>,
  tr: ({ children }) => <Table.Tr>{children}</Table.Tr>,
  th: ({ children }) => <Table.Th>{children}</Table.Th>,
  td: ({ children }) => <Table.Td>{children}</Table.Td>,

  strong: ({ children }) => (
    <Text span fw={700}>
      {children}
    </Text>
  ),
  em: ({ children }) => (
    <Text span fs="italic">
      {children}
    </Text>
  ),
  del: ({ children }) => (
    <Text span td="line-through">
      {children}
    </Text>
  ),

  hr: () => <hr style={{ margin: '1rem 0', borderColor: 'var(--mantine-color-dark-4)' }} />,
};

export default function MessageContent({ content }: MessageContentProps) {
  return (
    <Markdown remarkPlugins={[remarkGfm]} components={components}>
      {content}
    </Markdown>
  );
}
