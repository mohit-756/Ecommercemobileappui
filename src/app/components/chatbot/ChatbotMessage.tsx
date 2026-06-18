import { Sparkles, User } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { ChatMessage } from '../../contexts/ChatbotContext';

interface ChatbotMessageProps {
  message: ChatMessage;
}

export function ChatbotMessage({ message }: ChatbotMessageProps) {
  const isBot = message.role === 'assistant';

  return (
    <div className={cn('flex gap-3 w-full', isBot ? 'justify-start' : 'justify-end')}>
      {isBot && (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Sparkles size={16} className="text-primary" />
        </div>
      )}
      <div
        className={cn(
          'max-w-[85%] px-4 py-2.5 text-sm leading-relaxed',
          isBot
            ? 'bg-surface-secondary text-text-primary rounded-2xl rounded-bl-md'
            : 'bg-primary text-primary-foreground rounded-2xl rounded-br-md'
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        <span
          className={cn(
            'block text-[10px] mt-1 opacity-50',
            isBot ? 'text-text-tertiary' : 'text-primary-foreground/70'
          )}
        >
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      {!isBot && (
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
          <User size={16} className="text-primary-foreground" />
        </div>
      )}
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex gap-3 w-full justify-start">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Sparkles size={16} className="text-primary" />
      </div>
      <div className="bg-surface-secondary text-text-primary rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 bg-text-tertiary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-text-tertiary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-text-tertiary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
