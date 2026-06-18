import { chatbotService } from './chatbotService';

export interface ChatSession {
  active: boolean;
  startedAt: number;
}

class ChatServiceClass {
  private session: ChatSession | null = null;

  startSession(): ChatSession {
    this.session = {
      active: true,
      startedAt: Date.now(),
    };
    return this.session;
  }

  endSession(): void {
    this.session = null;
  }

  getSession(): ChatSession | null {
    return this.session;
  }

  isActive(): boolean {
    return this.session?.active ?? false;
  }

  async sendMessage(message: string): Promise<string> {
    return chatbotService.sendMessage(message);
  }

  getWelcomeMessage(userName?: string): string {
    if (userName) {
      return `Hi ${userName}, Welcome to our Dry Fruits Store! How can I help you today?`;
    }
    return 'Hi, Welcome to our Dry Fruits Store! How can I help you today?';
  }
}

export const chatService = new ChatServiceClass();
