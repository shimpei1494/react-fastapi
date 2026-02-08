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
    server.use(
      http.get('/api/test', () => {
        return HttpResponse.json({ message: 'success' });
      }),
    );

    const result = await api.get<{ message: string }>('/api/test');
    expect(result).toEqual({ message: 'success' });
  });

  it('エラーレスポンスでApiErrorをthrowする', async () => {
    server.use(
      http.get('/api/test', () => {
        return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
      }),
    );

    await expect(api.get('/api/test')).rejects.toThrow(ApiError);
    await expect(api.get('/api/test')).rejects.toMatchObject({
      status: 404,
    });
  });
});

describe('api.post', () => {
  it('成功時にJSONをパースして返す', async () => {
    server.use(
      http.post('/api/test', () => {
        return HttpResponse.json({ id: '123' }, { status: 201 });
      }),
    );

    const result = await api.post<{ id: string }>('/api/test', { name: 'test' });
    expect(result).toEqual({ id: '123' });
  });

  it('エラーレスポンスでApiErrorをthrowする', async () => {
    server.use(
      http.post('/api/test', () => {
        return HttpResponse.json({ error: 'Bad Request' }, { status: 400 });
      }),
    );

    await expect(api.post('/api/test', {})).rejects.toThrow(ApiError);
  });
});

describe('api.patch', () => {
  it('成功時にJSONをパースして返す', async () => {
    server.use(
      http.patch('/api/test/123', () => {
        return HttpResponse.json({ id: '123', updated: true });
      }),
    );

    const result = await api.patch<{ id: string; updated: boolean }>('/api/test/123', {});
    expect(result).toEqual({ id: '123', updated: true });
  });
});

describe('api.delete', () => {
  it('204レスポンスでundefinedを返す', async () => {
    server.use(
      http.delete('/api/test/123', () => {
        return new HttpResponse(null, { status: 204 });
      }),
    );

    const result = await api.delete('/api/test/123');
    expect(result).toBeUndefined();
  });

  it('エラーレスポンスでApiErrorをthrowする', async () => {
    server.use(
      http.delete('/api/test/123', () => {
        return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
      }),
    );

    await expect(api.delete('/api/test/123')).rejects.toThrow(ApiError);
  });
});
