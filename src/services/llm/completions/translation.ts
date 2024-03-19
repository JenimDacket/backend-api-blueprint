import { LLMChatMessage } from '../../../models/LLMChatMessage';
import { KernelBuilder } from '../llmKernel/llmKernel';

export const assistantMessageTranslationCompletion = async (
  message: LLMChatMessage,
): Promise<string> => {
  try {
    const prompt = message.content;
    /*     const prompt = promptReplacer(
      en.prompts.translateAssistantMessage,
      { key: 1, repl: 'English' },
      { key: 2, repl: message.content },
    ); */

    const kernel = new KernelBuilder()
      .withOpenAIChatCompletion({
        model: 'gpt-4',
        temperature: 0.1,
        maxTokens: 300,
      })
      .build();

    const completion = await kernel.completion(prompt);
    const parsed = JSON.parse(completion) as { translation: string; vocab: string };
    return parsed.translation + '\n\n' + parsed.vocab;
  } catch (e) {
    console.error('Error getting feedback completion: ', e);
    throw e;
  }
};
