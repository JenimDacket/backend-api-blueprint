import { sleep } from 'openai/core';
import { LanguageModelBase } from '../../../../types/llm';
import { LLMChatMessage } from '../../../../models/LLMChatMessage';

export class MockModel implements LanguageModelBase {
  public async chatCompletion(input: LLMChatMessage[]): Promise<LLMChatMessage> {
    console.log(input);
    await sleep(1000);
    return {
      content:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
      role: 'assistant',
    };
  }
}
