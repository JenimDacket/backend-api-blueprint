import { LLMChatMessage } from '../../models/LLMChatMessage';

export const getChatHistory = (messages: LLMChatMessage[]): string => {
  let chatHistory = '';
  messages.forEach(message => {
    if (message.role === 'user') {
      chatHistory += `user: ${message.content} \n`;
    }
    if (message.role === 'assistant') {
      chatHistory += `ai: ${message.content} \n`;
    }
  });
  return chatHistory;
};
