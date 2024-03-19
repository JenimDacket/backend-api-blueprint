import { context, trace } from '@opentelemetry/api';
import { v4 as uuidv4 } from 'uuid';
import { LLMChatMessage } from '../../../models/LLMChatMessage';
import { EmbeddingModelBase, LanguageModelBase, Memory, VectorStoreBase } from '../../../types/llm';
import { ApiServiceTracer } from '../../../utils/telemetry';
import { getOpenAIModel } from './languageModels/openai/getModel';
import { GPTConfig } from './languageModels/openai/openaiExtended.types';
import { getMockModel } from './mockKernel/getModel';
import { getQdrantMemoryStore } from './vectorStores/qdrant/getQdrantStore';

const { MOCK_APIS } = process.env;
export class LLMKernel {
  private modelBase: LanguageModelBase | undefined;
  private embeddingBase: EmbeddingModelBase | undefined;
  private vectorStore: VectorStoreBase<Memory> | undefined;

  constructor(
    modelBase: LanguageModelBase | undefined,
    embeddingBase: EmbeddingModelBase | undefined,
    vectorStore: VectorStoreBase<Memory> | undefined,
  ) {
    this.modelBase = modelBase;
    this.embeddingBase = embeddingBase;
    this.vectorStore = vectorStore;
  }

  public async chatCompletion(input: LLMChatMessage[]): Promise<LLMChatMessage> {
    const span = ApiServiceTracer.startSpan('llm.chat.completion', undefined, context.active());
    if (!this.modelBase) {
      throw new Error('No language model set');
    }
    const result = await this.modelBase.chatCompletion(input);
    span.setAttributes({ 'content.length': result.content.length, role: result.role });
    span.end();
    return result;
  }

  public async completion(
    input: string,
    validationCallback?: (completion: string) => boolean,
    retryCount: number = 3,
  ): Promise<string> {
    let count = 0;
    let completion;
    do {
      if (!this.modelBase) {
        throw new Error('No language model set');
      }
      if (count++ > retryCount) {
        throw new Error('Max retry exceeded');
      }
      const LLMChatMessage: LLMChatMessage = {
        role: 'user',
        content: input,
      };
      completion = (await this.modelBase.chatCompletion([LLMChatMessage])).content;
    } while (validationCallback && validationCallback(completion));

    const parentSpan = trace.getActiveSpan();
    parentSpan?.setAttribute('llm-validation-retries', count);

    return completion;
  }

  public async getEmbedding(input: string): Promise<number[]> {
    if (!this.embeddingBase) {
      throw new Error('No embedding model set');
    }
    return await this.embeddingBase.getEmbedding(input);
  }

  public async storeMemory(input: string, userId: string): Promise<void> {
    if (!this.vectorStore) {
      throw new Error('No vector store set');
    }
    const vector = await this.getEmbedding(input);
    await this.vectorStore.store({ id: uuidv4(), content: input, vector: vector, userId }, vector);
  }

  public async searchMemories(
    input: string,
    userId: string,
    searchThreshold: number = 0.5,
  ): Promise<Memory[]> {
    if (!this.vectorStore) {
      throw new Error('No vector store set');
    }
    if (searchThreshold < 0 || searchThreshold > 1) {
      throw new Error('Search threshold must be between 0 and 1');
    }
    const vector = await this.getEmbedding(input);
    const memories = await this.vectorStore.search(searchThreshold, vector, userId);
    return memories;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async chain(input: string[]): Promise<string> {
    throw new Error('Not implemented yet');
  }
}

export class KernelBuilder {
  private model: LanguageModelBase | undefined;
  private embeddingModel: EmbeddingModelBase | undefined;
  private vectorStore: VectorStoreBase<Memory> | undefined;

  public withOpenAIChatCompletion(config: GPTConfig) {
    if (MOCK_APIS === 'true') {
      this.model = getMockModel();
      return this;
    } else {
      this.model = getOpenAIModel(config);
      return this;
    }
  }

  public withQdrantVectorStore() {
    this.vectorStore = getQdrantMemoryStore();
    return this;
  }

  public withOpenAIEmbeddingModel(config: GPTConfig) {
    this.embeddingModel = getOpenAIModel(config);
    return this;
  }

  public build() {
    return new LLMKernel(this.model, this.embeddingModel, this.vectorStore);
  }
}
