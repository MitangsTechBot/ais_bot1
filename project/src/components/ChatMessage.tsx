import React from 'react';
import { MessageSquare, User } from 'lucide-react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`flex gap-2 sm:gap-4 ${isAssistant ? 'items-start' : 'items-start flex-row-reverse'}`}>
      <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isAssistant ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
      }`}>
        {isAssistant ? <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" /> : <User className="w-3 h-3 sm:w-4 sm:h-4" />}
      </div>
      <div className={`flex-1 max-w-[85%] sm:max-w-[80%] md:max-w-[75%] rounded-lg px-3 py-2 sm:px-4 sm:py-2 ${
        isAssistant ? 'bg-white border border-gray-200' : 'bg-blue-600 text-white'
      }`}>
        <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">{message.content}</p>
      </div>
    </div>
  );
};

export default ChatMessage;