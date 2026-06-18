import { chatbotEngine } from './chatbotEngine';

export const chatbotService = {
  async sendMessage(userMessage: string): Promise<string> {
    try {
      return await chatbotEngine.sendMessage(userMessage);
    } catch (error) {
      console.error('Chatbot service error:', error);
      return 'Our support assistant is temporarily unavailable. Please try again later.';
    }
  },

  clearCache() {
    chatbotEngine.clearCache();
  },
};
