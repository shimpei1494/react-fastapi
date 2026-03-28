import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'jotai';
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import type { ReactNode } from 'react';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import type { ThreadResponse } from '../../types/chat';
import { useThreads } from '../useThreads';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function wrapper({ children }: { children: ReactNode }) {
  return <Provider>{children}</Provider>;
}

describe('useThreads', () => {
  it('fetchThreadsでスレッド一覧を取得できる', async () => {
    // Arrange
    const mockThreads: ThreadResponse[] = [
      {
        id: '1',
        title: 'Thread 1',
        lastMessage: 'Hello',
        timestamp: '2026-02-08T00:00:00Z',
      },
      {
        id: '2',
        title: 'Thread 2',
        lastMessage: 'World',
        timestamp: '2026-02-08T01:00:00Z',
      },
    ];

    server.use(
      http.get('/api/threads', () => {
        return HttpResponse.json(mockThreads);
      }),
    );

    // Act
    const { result } = renderHook(() => useThreads(), { wrapper });

    // Assert
    expect(result.current.threads).toEqual([]);

    // Act
    await waitFor(() => {
      expect(result.current.threads).toHaveLength(2);
    });

    // Assert
    expect(result.current.threads[0].title).toBe('Thread 1');
    expect(result.current.threads[1].title).toBe('Thread 2');
  });

  it('fetchThreadsでエラーが発生した場合、エラーを設定する', async () => {
    // Arrange
    server.use(
      http.get('/api/threads', () => {
        return HttpResponse.json({ error: 'Server Error' }, { status: 500 });
      }),
    );

    // Act
    const { result } = renderHook(() => useThreads(), { wrapper });

    // Act
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Assert
    expect(result.current.error).toBeDefined();
    expect(result.current.threads).toEqual([]);
  });

  it('deleteThreadでスレッドを削除できる', async () => {
    // Arrange
    const mockThreads: ThreadResponse[] = [
      {
        id: '1',
        title: 'Thread 1',
        lastMessage: 'Hello',
        timestamp: '2026-02-08T00:00:00Z',
      },
    ];

    server.use(
      http.get('/api/threads', () => {
        return HttpResponse.json(mockThreads);
      }),
      http.delete('/api/threads/1', () => {
        return new HttpResponse(null, { status: 204 });
      }),
    );

    // Act
    const { result } = renderHook(() => useThreads(), { wrapper });

    // Act
    await waitFor(() => {
      expect(result.current.threads).toHaveLength(1);
    });

    await result.current.deleteThread('1');

    // Assert
    await waitFor(() => {
      expect(result.current.threads).toHaveLength(0);
    });
  });
});
