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

// APIレスポンス型（camelCase）
export interface ThreadResponse {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
}

export interface MessageResponse {
  id: string;
  threadId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// UI状態
export interface LoadingState {
  threads: boolean;
  messages: boolean;
  sending: boolean;
}

export interface StreamingMessage {
  threadId: string;
  content: string;
}
