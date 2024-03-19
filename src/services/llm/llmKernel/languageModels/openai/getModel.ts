import OpenAI from 'openai';
import { EmbeddingModelBase, LanguageModelBase } from '../../../../../types/llm';
import { OpenAiModel } from './openaiModel';
import { RequestOptions } from 'openai/core';
import { GPTConfig } from './openaiExtended.types';

const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const getOpenAIModel = (
  config: GPTConfig,
  options?: RequestOptions,
): LanguageModelBase & EmbeddingModelBase => {
  return new OpenAiModel(openaiClient, config, options);
};
