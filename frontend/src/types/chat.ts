export interface Thread {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

export interface Message {
  id: string;
  threadId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
