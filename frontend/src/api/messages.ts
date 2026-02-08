import type { MessageResponse } from '../types/chat';
import { api } from './client';

export const messagesApi = {
  getByThread: (threadId: string) =>
    api.get<MessageResponse[]>(`/api/threads/${threadId}/messages`),

  create: (threadId: string, content: string) =>
    api.post<MessageResponse>(`/api/threads/${threadId}/messages`, { content }),

  streamResponse: async function* (
    threadId: string,
    content: string,
  ): AsyncGenerator<string, void, unknown> {
    const response = await fetch(`/api/threads/${threadId}/messages/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error(`Stream request failed: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            return;
          }
          yield JSON.parse(data) as string;
        }
      }
    }

    if (buffer.startsWith('data: ')) {
      const data = buffer.slice(6);
      if (data !== '[DONE]') {
        yield JSON.parse(data) as string;
      }
    }
  },
};
