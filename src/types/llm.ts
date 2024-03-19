import { LLMChatMessage } from '../models/LLMChatMessage';

export type LanguageModelBase = {
  chatCompletion: (input: LLMChatMessage[]) => Promise<LLMChatMessage>;
};

export type EmbeddingModelBase = {
  getEmbedding: (input: string) => Promise<number[]>;
};

export type VectorStoreBase<T> = {
  setup: (vectorSize: number) => Promise<void>;
  store: (input: T, vector: number[]) => Promise<void>;
  search: (searchThreshold: number, vector: number[], userId: string) => Promise<T[]>;
};

export type Memory = {
  id: string;
  content: string;
  userId: string;
  vector: number[];
};
