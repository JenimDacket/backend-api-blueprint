import { KernelBuilder } from './llmKernel/llmKernel';

export const memoryTest = async () => {
  const kernel = new KernelBuilder()
    .withOpenAIEmbeddingModel({
      model: 'text-embedding-ada-002',
    })
    .withQdrantVectorStore()
    .build();

  /// await kernel.storeMemory('Jupiter', 'user1');
  // await kernel.storeMemory('Saturn', 'user2');
  const memories = await kernel.searchMemories('planet', 'user1');
  const memories2 = await kernel.searchMemories('planet', 'user2');
  console.log('memories 1: ', memories);
  console.log('memories 2: ', memories2);
};
