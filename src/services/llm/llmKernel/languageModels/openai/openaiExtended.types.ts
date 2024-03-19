export type GPTModel =
  | 'gpt-4'
  | 'gpt-4-32k'
  | 'gpt-3.5-turbo'
  | 'gpt-3.5-turbo-16k'
  | 'whisper-1'
  | 'text-embedding-ada-002'; // whisper model for speech to text

export type GPTConfig = {
  model: GPTModel;
  temperature?: number; // float between 0 and 1; should default to 0
  maxTokens?: number;
};
