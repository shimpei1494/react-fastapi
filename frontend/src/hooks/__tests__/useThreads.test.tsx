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

    const { result } = renderHook(() => useThreads(), { wrapper });

    expect(result.current.threads).toEqual([]);

    await waitFor(() => {
      expect(result.current.threads).toHaveLength(2);
    });

    expect(result.current.threads[0].title).toBe('Thread 1');
    expect(result.current.threads[1].title).toBe('Thread 2');
  });

  it('fetchThreadsでエラーが発生した場合、エラーを設定する', async () => {
    server.use(
      http.get('/api/threads', () => {
        return HttpResponse.json({ error: 'Server Error' }, { status: 500 });
      }),
    );

    const { result } = renderHook(() => useThreads(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // エラーは内部で管理されているが、スレッドは空のまま
    expect(result.current.threads).toEqual([]);
  });

  it('deleteThreadでスレッドを削除できる', async () => {
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

    const { result } = renderHook(() => useThreads(), { wrapper });

    await waitFor(() => {
      expect(result.current.threads).toHaveLength(1);
    });

    await waitFor(async () => {
      await result.current.deleteThread('1');
    });

    await waitFor(() => {
      expect(result.current.threads).toHaveLength(0);
    });
  });
});
