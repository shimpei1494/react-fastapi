import { atom } from 'jotai';
import type { LoadingState } from '../types/chat';

export const loadingAtom = atom<LoadingState>({
  threads: false,
  messages: false,
  sending: false,
});

export const errorAtom = atom<{
  threads: string | null;
  messages: string | null;
  sending: string | null;
}>({
  threads: null,
  messages: null,
  sending: null,
});

export const threadNotFoundAtom = atom<boolean>(false);
