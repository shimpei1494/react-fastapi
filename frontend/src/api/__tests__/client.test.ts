import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ApiError, api } from '../client';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('api.get', () => {
  it('成功時にJSONをパースして返す', async () => {
    // Arrange
    server.use(
      http.get('/api/test', () => {
        return HttpResponse.json({ message: 'success' });
      }),
    );

    // Act
    const result = await api.get<{ message: string }>('/api/test');

    // Assert
    expect(result).toEqual({ message: 'success' });
  });

  it('エラーレスポンスでApiErrorをthrowする', async () => {
    // Arrange
    server.use(
      http.get('/api/test', () => {
        return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
      }),
    );

    // Act
    await expect(api.get('/api/test')).rejects.toThrow(ApiError);

    // Assert
    await expect(api.get('/api/test')).rejects.toMatchObject({
      status: 404,
    });
  });
});

describe('api.post', () => {
  it('成功時にJSONをパースして返す', async () => {
    // Arrange
    server.use(
      http.post('/api/test', () => {
        return HttpResponse.json({ id: '123' }, { status: 201 });
      }),
    );

    // Act
    const result = await api.post<{ id: string }>('/api/test', { name: 'test' });

    // Assert
    expect(result).toEqual({ id: '123' });
  });

  it('エラーレスポンスでApiErrorをthrowする', async () => {
    // Arrange
    server.use(
      http.post('/api/test', () => {
        return HttpResponse.json({ error: 'Bad Request' }, { status: 400 });
      }),
    );

    // Act
    await expect(api.post('/api/test', {})).rejects.toThrow(ApiError);

    // Assert
  });
});

describe('api.patch', () => {
  it('成功時にJSONをパースして返す', async () => {
    // Arrange
    server.use(
      http.patch('/api/test/123', () => {
        return HttpResponse.json({ id: '123', updated: true });
      }),
    );

    // Act
    const result = await api.patch<{ id: string; updated: boolean }>('/api/test/123', {});

    // Assert
    expect(result).toEqual({ id: '123', updated: true });
  });
});

describe('api.delete', () => {
  it('204レスポンスでundefinedを返す', async () => {
    // Arrange
    server.use(
      http.delete('/api/test/123', () => {
        return new HttpResponse(null, { status: 204 });
      }),
    );

    // Act
    const result = await api.delete('/api/test/123');

    // Assert
    expect(result).toBeUndefined();
  });

  it('エラーレスポンスでApiErrorをthrowする', async () => {
    // Arrange
    server.use(
      http.delete('/api/test/123', () => {
        return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
      }),
    );

    // Act
    await expect(api.delete('/api/test/123')).rejects.toThrow(ApiError);

    // Assert
  });
});
