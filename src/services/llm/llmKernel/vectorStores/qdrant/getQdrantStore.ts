import { Memory, VectorStoreBase } from '../../../../../types/llm';
import { QdrantStore } from './qdrantStore';

let quadrantStore: VectorStoreBase<Memory>;
export const initializeQdrantMemoryStore = async (vectorSize: number): Promise<void> => {
  try {
    quadrantStore = new QdrantStore('Memories');
    await quadrantStore.setup(vectorSize);
  } catch (e) {
    console.error('Error initializing Qdrant memory store');
    console.log(e);
  }
};

export const getQdrantMemoryStore = (): VectorStoreBase<Memory> => {
  if (!quadrantStore) {
    throw new Error('Qdrant memory store not initialized');
  }
  return quadrantStore;
};
