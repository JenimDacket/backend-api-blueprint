export type LLMChatMessage = {
  /**
   * @pattern ^(system|user|assistant)$
   */
  role: string;
  /**
   * @minLength 1
   * @maxLength 1000
   */
  content: string;
};
