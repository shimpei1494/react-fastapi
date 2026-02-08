import type { ThreadResponse } from '../types/chat';
import { api } from './client';

export const threadsApi = {
  getAll: () => api.get<ThreadResponse[]>('/api/threads'),
  create: (title: string) => api.post<ThreadResponse>('/api/threads', { title }),
};
