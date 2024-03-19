import { RequestOptions } from 'openai/core';
import { LanguageModelBase, EmbeddingModelBase } from '../../../../../types/llm';
import OpenAI from 'openai';
import { ChatCompletionRole } from 'openai/resources';
import { GPTConfig } from './openaiExtended.types';
import { LLMChatMessage } from '../../../../../models/LLMChatMessage';

export class OpenAiModel implements LanguageModelBase, EmbeddingModelBase {
  client: OpenAI;
  config: GPTConfig;
  options?: RequestOptions;

  constructor(client: OpenAI, config: GPTConfig, options?: RequestOptions) {
    this.client = client;
    this.config = config;
    this.options = options;
  }
  public async getEmbedding(input: string): Promise<number[]> {
    const embedding = await this.client.embeddings.create(
      { input, model: 'text-embedding-ada-002' },
      this.options,
    );
    if (!embedding.data[0]) {
      throw new Error('No returned embedding data');
    }
    return embedding.data[0].embedding;
  }

  public async chatCompletion(input: LLMChatMessage[]): Promise<LLMChatMessage> {
    console.log('Type of input: ', Array.isArray(input) ? 'Array' : typeof input);
    console.log('input contains: ', input);
    const openAiMessages = input.map(message => {
      console.log('map message: ', message);
      return {
        content: message.content,
        role: this.mapRoleString(message.role),
      };
    });
    console.log('message parse end');
    const response = await this.client.chat.completions.create(
      {
        messages: openAiMessages,
        model: this.config.model,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
      },
      this.options,
    );

    if (response.choices[0].message.content === null) {
      throw new Error('GPT response does not contain content');
    }

    return { content: response.choices[0].message.content, role: response.choices[0].message.role };
  }

  private mapRoleString(role: string): ChatCompletionRole {
    const openAiRoles = ['system', 'user', 'assistant', 'function'];
    if (!openAiRoles.includes(role)) {
      throw new Error('role string does not match any ChatCompletionRoles from openai');
    }
    return role as ChatCompletionRole;
  }
}
