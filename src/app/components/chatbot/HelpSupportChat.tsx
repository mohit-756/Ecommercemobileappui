import { useState } from 'react';
import { MessageCircle, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../contexts/AuthContext';
import { LiveChatModal } from './LiveChatModal';
import { chatService } from '../../services/ChatService';

export function HelpSupportChat() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { t } = useTranslation();
  const { user } = useAuth();

  const handleOpenChat = () => {
    chatService.startSession();
    setIsChatOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
  };

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handleOpenChat}
        className="w-full bg-white dark:bg-surface p-4 rounded-2xl flex items-center gap-4 shadow-sm border border-gray-100 dark:border-border-light cursor-pointer hover:shadow-md transition-shadow"
      >
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
          <MessageCircle size={24} />
        </div>
        <div className="flex-1 text-left">
          <p className="font-bold text-gray-900 dark:text-text-primary">{t('liveChat')}</p>
          <p className="text-xs text-gray-500 dark:text-text-secondary">{t('liveChatDesc')}</p>
        </div>
        <ChevronRight size={20} className="text-gray-400 dark:text-text-tertiary" />
      </motion.button>

      <LiveChatModal isOpen={isChatOpen} onClose={handleCloseChat} />
    </>
  );
}
