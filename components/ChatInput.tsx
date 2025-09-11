import React, { useState } from 'react';
import { SendIcon } from './icons/SendIcon';
import { StopIcon } from './icons/StopIcon';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onStop: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, onStop }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-slate-800/50 backdrop-blur-sm border-t border-slate-700/50">
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          className="w-full bg-slate-700 text-slate-200 placeholder-slate-400 rounded-full py-3 pl-5 pr-14 focus:outline-none focus:ring-2 focus:ring-sky-500/70 transition-shadow"
          disabled={isLoading}
        />
        {isLoading ? (
          <button
            type="button"
            onClick={onStop}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white hover:opacity-90 transition-all duration-150 ease-in-out active:scale-95"
            aria-label="Stop generating response"
          >
            <StopIcon className="w-5 h-5" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 text-white hover:opacity-90 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-150 ease-in-out active:scale-95"
            aria-label="Send message"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    </form>
  );
};

export default ChatInput;
