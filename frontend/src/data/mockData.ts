import type { Message, Thread } from '../types/chat';

export const mockThreads: Thread[] = [
  {
    id: 't1',
    title: 'React Hooksについて',
    lastMessage: 'useEffectの使い方を教えて',
    timestamp: new Date('2025-02-01T10:30:00'),
  },
  {
    id: 't2',
    title: 'TypeScript型定義',
    lastMessage: 'Genericsの実装例を見せて',
    timestamp: new Date('2025-01-31T14:20:00'),
  },
  {
    id: 't3',
    title: 'Python FastAPI入門',
    lastMessage: 'エンドポイントの定義方法は？',
    timestamp: new Date('2025-01-30T09:15:00'),
  },
  {
    id: 't4',
    title: 'Git操作まとめ',
    lastMessage: 'rebaseとmergeの違い',
    timestamp: new Date('2025-01-29T16:45:00'),
  },
  {
    id: 't5',
    title: 'CSS Gridレイアウト',
    lastMessage: 'レスポンシブデザインの例',
    timestamp: new Date('2025-01-28T11:00:00'),
  },
];

export const mockMessages: Message[] = [
  // Thread t1: React Hooks
  {
    id: 'm1',
    threadId: 't1',
    role: 'user',
    content: 'React Hooksについて教えてください。特にuseEffectの使い方が知りたいです。',
    timestamp: new Date('2025-02-01T10:00:00'),
  },
  {
    id: 'm2',
    threadId: 't1',
    role: 'assistant',
    content:
      'useEffectは副作用を扱うためのHookです。コンポーネントのレンダリング後に実行される処理を定義できます。\n\n主な使い方：\n1. データフェッチ\n2. イベントリスナーの登録/解除\n3. DOMの直接操作\n\n依存配列を第2引数に渡すことで、特定の値が変化した時だけ実行されるように制御できます。',
    timestamp: new Date('2025-02-01T10:00:15'),
  },
  {
    id: 'm3',
    threadId: 't1',
    role: 'user',
    content: 'クリーンアップ関数について詳しく教えて。',
    timestamp: new Date('2025-02-01T10:05:00'),
  },
  {
    id: 'm4',
    threadId: 't1',
    role: 'assistant',
    content:
      'useEffectから返す関数がクリーンアップ関数です。コンポーネントがアンマウントされる時や、次のeffectが実行される前に呼ばれます。\n\nイベントリスナーの解除やタイマーのクリアなど、リソースの解放に使います。',
    timestamp: new Date('2025-02-01T10:05:10'),
  },

  // Thread t2: TypeScript
  {
    id: 'm5',
    threadId: 't2',
    role: 'user',
    content: 'TypeScriptのGenericsについて教えてください。',
    timestamp: new Date('2025-01-31T14:00:00'),
  },
  {
    id: 'm6',
    threadId: 't2',
    role: 'assistant',
    content:
      'Genericsは型をパラメータとして受け取る仕組みです。関数やクラスを汎用的に定義でき、型安全性を保ちながらコードの再利用性を高められます。\n\n例: `function identity<T>(arg: T): T { return arg; }`',
    timestamp: new Date('2025-01-31T14:00:12'),
  },
  {
    id: 'm7',
    threadId: 't2',
    role: 'user',
    content: 'constraintsの使い方も教えて。',
    timestamp: new Date('2025-01-31T14:10:00'),
  },
  {
    id: 'm8',
    threadId: 't2',
    role: 'assistant',
    content:
      '`extends`キーワードで型パラメータに制約をかけられます。\n\n例: `function getLength<T extends { length: number }>(arg: T): number { return arg.length; }`\n\nこれにより、lengthプロパティを持つ型のみ受け付けるようになります。',
    timestamp: new Date('2025-01-31T14:10:08'),
  },

  // Thread t3: FastAPI
  {
    id: 'm9',
    threadId: 't3',
    role: 'user',
    content: 'FastAPIでエンドポイントを定義する方法を教えて。',
    timestamp: new Date('2025-01-30T09:00:00'),
  },
  {
    id: 'm10',
    threadId: 't3',
    role: 'assistant',
    content:
      "FastAPIではデコレータを使ってエンドポイントを定義します。\n\n```python\nfrom fastapi import FastAPI\n\napp = FastAPI()\n\n@app.get('/items/{item_id}')\nasync def read_item(item_id: int):\n    return {'item_id': item_id}\n```\n\nPydanticモデルでリクエスト/レスポンスの型を定義すると、自動バリデーションとドキュメント生成が行われます。",
    timestamp: new Date('2025-01-30T09:00:20'),
  },

  // Thread t4: Git
  {
    id: 'm11',
    threadId: 't4',
    role: 'user',
    content: 'git rebaseとmergeの違いを教えて。',
    timestamp: new Date('2025-01-29T16:30:00'),
  },
  {
    id: 'm12',
    threadId: 't4',
    role: 'assistant',
    content:
      'mergeはブランチの履歴をそのまま保持してマージコミットを作成します。rebaseはコミット履歴を直線的に書き換えます。\n\nmerge: 履歴が正確、コンフリクト解決が1回\nrebase: 履歴がきれい、コンフリクト解決がコミットごと\n\nチームの方針に合わせて使い分けましょう。',
    timestamp: new Date('2025-01-29T16:30:15'),
  },

  // Thread t5: CSS Grid
  {
    id: 'm13',
    threadId: 't5',
    role: 'user',
    content: 'CSS Gridの基本的な使い方を教えて。',
    timestamp: new Date('2025-01-28T11:00:00'),
  },
  {
    id: 'm14',
    threadId: 't5',
    role: 'assistant',
    content:
      'CSS Gridは2次元レイアウトシステムです。\n\n```css\n.container {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 16px;\n}\n```\n\n`grid-template-columns`で列の定義、`grid-template-rows`で行の定義ができます。`fr`単位で柔軟なサイズ指定が可能です。',
    timestamp: new Date('2025-01-28T11:00:18'),
  },
];
