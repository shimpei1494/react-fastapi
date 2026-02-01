import { CodeHighlight } from '@mantine/code-highlight';
import { Code, Text } from '@mantine/core';
import type { ReactNode } from 'react';

interface MessageContentProps {
  content: string;
}

interface ContentPart {
  type: 'text' | 'code';
  value: string;
  language?: string;
}

const CODE_BLOCK_REGEX = /```(\w*)\n([\s\S]*?)```/g;
const INLINE_CODE_REGEX = /`([^`]+)`/g;

function parseContent(content: string): ContentPart[] {
  const parts: ContentPart[] = [];
  let lastIndex = 0;

  for (const match of content.matchAll(CODE_BLOCK_REGEX)) {
    const matchIndex = match.index;

    if (matchIndex > lastIndex) {
      parts.push({ type: 'text', value: content.slice(lastIndex, matchIndex) });
    }

    parts.push({
      type: 'code',
      value: match[2],
      language: match[1] || 'text',
    });

    lastIndex = matchIndex + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({ type: 'text', value: content.slice(lastIndex) });
  }

  return parts;
}

function renderInlineCode(text: string): ReactNode[] {
  const result: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(INLINE_CODE_REGEX)) {
    const matchIndex = match.index;

    if (matchIndex > lastIndex) {
      result.push(text.slice(lastIndex, matchIndex));
    }

    result.push(<Code key={matchIndex}>{match[1]}</Code>);
    lastIndex = matchIndex + match[0].length;
  }

  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return result;
}

export default function MessageContent({ content }: MessageContentProps) {
  const parts = parseContent(content);

  if (parts.length === 1 && parts[0].type === 'text') {
    return (
      <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
        {renderInlineCode(content)}
      </Text>
    );
  }

  return (
    <>
      {parts.map((part, i) => {
        const key = `${part.type}-${i}`;
        if (part.type === 'code') {
          return (
            <CodeHighlight key={key} code={part.value} language={part.language ?? 'text'} my="xs" />
          );
        }
        return part.value.trim() ? (
          <Text key={key} size="sm" style={{ whiteSpace: 'pre-wrap' }}>
            {renderInlineCode(part.value.trim())}
          </Text>
        ) : null;
      })}
    </>
  );
}
