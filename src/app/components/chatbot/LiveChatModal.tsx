import { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useChatbot } from '../../contexts/ChatbotContext';
import { useAuth } from '../../contexts/AuthContext';
import { ChatbotMessage, TypingIndicator } from './ChatbotMessage';
import { cn } from '../../lib/utils';

const QUICK_ACTIONS = [
  { label: 'Product Availability', message: 'What products are available in your store?' },
  { label: 'Product Prices', message: 'What are the prices of your dry fruits?' },
  { label: 'Delivery Time', message: 'What are your delivery timelines?' },
  { label: 'Order Status', message: 'How can I check my order status?' },
  { label: 'Contact Support', message: 'How can I contact customer support?' },
];

interface LiveChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LiveChatModal({ isOpen, onClose }: LiveChatModalProps) {
  const { messages, isLoading, sendMessage, clearChat, addBotMessage } = useChatbot();
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const welcomeAdded = useRef(false);

  useEffect(() => {
    if (messages.length === 0) {
      welcomeAdded.current = false;
    }
    if (!isOpen) return;
    if (messages.length === 0 && !welcomeAdded.current) {
      welcomeAdded.current = true;
      const userName = user?.name?.split(' ')[0];
      const welcome = userName
        ? `Hi ${userName}, Welcome to our Dry Fruits Store! How can I help you today?`
        : 'Hi, Welcome to our Dry Fruits Store! How can I help you today?';
      addBotMessage(welcome);
    }
  }, [isOpen, messages.length, user, addBotMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClose = () => {
    onClose();
  };

  const hasUserMessages = messages.some(m => m.role === 'user');
  const showQuickActions = messages.length <= 1 && !hasUserMessages && !isLoading;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn(
              'fixed z-50 flex flex-col bg-white dark:bg-surface shadow-2xl border border-border-light',
              'inset-0',
              'sm:top-auto sm:inset-x-4 sm:bottom-4 sm:h-[85vh] sm:rounded-2xl sm:max-h-[calc(100dvh-32px)]',
              'lg:inset-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-[480px] lg:h-[650px] lg:max-h-[calc(100dvh-80px)] lg:rounded-2xl'
            )}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-light shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles size={18} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">DryFruit Assistant</h3>
                  <p className="text-[10px] text-text-tertiary">Online &bull; We reply instantly</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={clearChat}
                  className="p-2 text-text-tertiary hover:text-text-secondary hover:bg-surface-secondary rounded-xl transition-colors"
                  title="Clear chat"
                  type="button"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  onClick={handleClose}
                  className="p-2 text-text-tertiary hover:text-text-secondary hover:bg-surface-secondary rounded-xl transition-colors"
                  title="Close"
                  type="button"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 hide-scrollbar">
              {messages.map((msg) => (
                <ChatbotMessage key={msg.id} message={msg} />
              ))}

              {isLoading && <TypingIndicator />}

              {showQuickActions && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => sendMessage(action.message)}
                      className="text-xs font-medium px-3 py-1.5 rounded-full bg-surface-secondary text-text-secondary hover:bg-primary/10 hover:text-primary border border-border-light transition-colors"
                      type="button"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t border-border-light shrink-0">
              <div className="flex items-center gap-2 bg-surface-secondary rounded-2xl px-4 py-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  className="flex-1 bg-transparent border-none outline-none text-sm text-text-primary placeholder-text-tertiary"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className={cn(
                    'p-2 rounded-xl transition-all shrink-0',
                    input.trim() && !isLoading
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-surface-tertiary text-text-tertiary'
                  )}
                  type="button"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </div>
                <p className="text-[10px] text-text-tertiary text-center mt-1.5">
                Store Assistant &bull; Product &amp; order queries only
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
