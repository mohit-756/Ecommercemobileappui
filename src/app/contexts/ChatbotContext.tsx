import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { chatbotService } from '../services/chatbotService';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ChatbotContextType {
  isOpen: boolean;
  messages: ChatMessage[];
  isLoading: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
  sendMessage: (content: string) => Promise<void>;
  addBotMessage: (content: string) => void;
  clearChat: () => void;
}

const ChatbotContext = createContext<ChatbotContextType | null>(null);

const STORAGE_KEY = 'dryfruit_chatbot_messages';

function loadMessages(): ChatMessage[] {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

function saveMessages(messages: ChatMessage[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {}
}

export function ChatbotProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(loadMessages);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  useEffect(() => {
    const handleLogout = () => {
      setMessages([]);
      sessionStorage.removeItem(STORAGE_KEY);
    };
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const toggle = useCallback(() => setIsOpen(prev => !prev), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const clearChat = useCallback(() => {
    setMessages([]);
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  const addBotMessage = useCallback((content: string) => {
    const msg: ChatMessage = {
      id: `bot-${Date.now()}`,
      role: 'assistant',
      content,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, msg]);
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      console.log('Sending message to chatbot service...');
      const response = await chatbotService.sendMessage(content);
      console.log('Chatbot response received');
      addBotMessage(response);
    } catch (error) {
      console.error('Chatbot error caught in context:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
      addBotMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, addBotMessage]);

  return (
    <ChatbotContext.Provider value={{ isOpen, messages, isLoading, toggle, open, close, sendMessage, addBotMessage, clearChat }}>
      {children}
    </ChatbotContext.Provider>
  );
}

export function useChatbot() {
  const context = useContext(ChatbotContext);
  if (!context) throw new Error('useChatbot must be used within ChatbotProvider');
  return context;
}
