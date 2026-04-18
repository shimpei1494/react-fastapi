import { renderHook, waitFor } from '@testing-library/react';
import { Provider, useAtomValue } from 'jotai';
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import type { ReactNode } from 'react';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { threadNotFoundAtom } from '../../stores/uiAtoms';
import type { MessageResponse } from '../../types/chat';
import { useMessages } from '../useMessages';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function wrapper({ children }: { children: ReactNode }) {
  return <Provider>{children}</Provider>;
}

describe('useMessages', () => {
  it('スレッドIDがnullの場合、メッセージを取得しない', () => {
    // Arrange

    // Act
    const { result } = renderHook(() => useMessages(null), { wrapper });

    // Assert
    expect(result.current.messages).toEqual([]);
  });

  it('スレッドIDが指定されている場合、メッセージを取得する', async () => {
    // Arrange
    const mockMessages: MessageResponse[] = [
      {
        id: 'm1',
        threadId: 't1',
        role: 'user',
        content: 'Hello',
        timestamp: '2026-02-08T00:00:00Z',
      },
      {
        id: 'm2',
        threadId: 't1',
        role: 'assistant',
        content: 'Hi there',
        timestamp: '2026-02-08T00:01:00Z',
      },
    ];

    server.use(
      http.get('/api/threads/t1/messages', () => {
        return HttpResponse.json(mockMessages);
      }),
    );

    // Act
    const { result } = renderHook(() => useMessages('t1'), { wrapper });

    // Act
    await waitFor(() => {
      expect(result.current.messages).toHaveLength(2);
    });

    // Assert
    expect(result.current.messages[0].content).toBe('Hello');
    expect(result.current.messages[0].role).toBe('user');
    expect(result.current.messages[1].content).toBe('Hi there');
    expect(result.current.messages[1].role).toBe('assistant');
  });

  it('既にキャッシュされている場合、再取得しない', async () => {
    // Arrange
    let requestCount = 0;

    server.use(
      http.get('/api/threads/t1/messages', () => {
        requestCount++;
        return HttpResponse.json([]);
      }),
    );

    // Act
    const { result, rerender } = renderHook(() => useMessages('t1'), { wrapper });

    // Act
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Assert
    expect(requestCount).toBe(1);

    // Act
    rerender();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Assert
    expect(requestCount).toBe(1);
  });

  it('エラーが発生した場合、メッセージは空のまま', async () => {
    // Arrange
    server.use(
      http.get('/api/threads/t1/messages', () => {
        return HttpResponse.json({ error: 'Server Error' }, { status: 500 });
      }),
    );

    // Act
    const { result } = renderHook(() => useMessages('t1'), { wrapper });

    // Act
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Assert
    expect(result.current.messages).toEqual([]);
  });

  it('404エラーの場合、threadNotFoundAtom が true になる', async () => {
    // Arrange
    server.use(
      http.get('/api/threads/not-found/messages', () => {
        return HttpResponse.json({ detail: 'Thread not found' }, { status: 404 });
      }),
    );

    // Act
    const { result } = renderHook(
      () => ({
        hook: useMessages('not-found'),
        threadNotFound: useAtomValue(threadNotFoundAtom),
      }),
      { wrapper },
    );

    // Assert
    await waitFor(() => {
      expect(result.current.threadNotFound).toBe(true);
    });
    expect(result.current.hook.messages).toEqual([]);
  });

  it('404以外のエラーでは threadNotFoundAtom は変わらない', async () => {
    // Arrange
    server.use(
      http.get('/api/threads/t1/messages', () => {
        return HttpResponse.json({ error: 'Server Error' }, { status: 500 });
      }),
    );

    // Act
    const { result } = renderHook(
      () => ({
        hook: useMessages('t1'),
        threadNotFound: useAtomValue(threadNotFoundAtom),
      }),
      { wrapper },
    );

    // Assert
    await waitFor(() => {
      expect(result.current.hook.loading).toBe(false);
    });
    expect(result.current.threadNotFound).toBe(false);
  });

  it('threadId が変わったとき、threadNotFoundAtom がリセットされる', async () => {
    // Arrange
    server.use(
      http.get('/api/threads/not-found/messages', () => {
        return HttpResponse.json({ detail: 'Thread not found' }, { status: 404 });
      }),
      http.get('/api/threads/t1/messages', () => {
        return HttpResponse.json([]);
      }),
    );

    // Act: 存在しないスレッドで 404 を発生させる
    const { result, rerender } = renderHook(
      ({ threadId }: { threadId: string }) => ({
        hook: useMessages(threadId),
        threadNotFound: useAtomValue(threadNotFoundAtom),
      }),
      { wrapper, initialProps: { threadId: 'not-found' } },
    );

    await waitFor(() => {
      expect(result.current.threadNotFound).toBe(true);
    });

    // Act: 有効なスレッドに切り替える
    rerender({ threadId: 't1' });

    // Assert: フラグがリセットされている
    await waitFor(() => {
      expect(result.current.threadNotFound).toBe(false);
    });
  });
});
