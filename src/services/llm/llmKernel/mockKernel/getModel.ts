import { LanguageModelBase } from '../../../../types/llm';
import { MockModel } from './mockModel';

export const getMockModel = (): LanguageModelBase => {
  return new MockModel();
};
