import type { ThreadResponse } from '../types/chat';
import { api } from './client';

interface GenerateTitleResponse {
  title: string;
}

export const threadsApi = {
  getAll: () => api.get<ThreadResponse[]>('/api/threads'),
  create: (title: string) => api.post<ThreadResponse>('/api/threads', { title }),
  generateTitle: (threadId: string, content: string) =>
    api.post<GenerateTitleResponse>(`/api/threads/${threadId}/generate-title`, { content }),
};
