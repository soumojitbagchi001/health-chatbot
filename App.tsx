import React, { useState, useEffect, useRef } from 'react';
import type { Chat } from '@google/genai';
import { createChatSession } from './services/geminiService';
import { Author, ChatMessage as Message } from './types';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import { ArrowLeftIcon } from './components/icons/ArrowLeftIcon';
import { RobotIcon } from './components/icons/RobotIcon';

const App: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [chat, setChat] = useState<Chat | null>(null);
  const [history, setHistory] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const isAnimatingRef = useRef(false);
  const stopGeneratingRef = useRef(false);

  useEffect(() => {
    setChat(createChatSession());
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleStopGenerating = () => {
    stopGeneratingRef.current = true;
    setIsLoading(false);
  };

  const handleSendMessage = async (message: string) => {
    if (!chat) return;

    const userMessage: Message = { author: Author.USER, text: message };
    setIsLoading(true);
    stopGeneratingRef.current = false;
    // Add user message and a placeholder for the bot's response
    setHistory((prev) => [...prev, userMessage, { author: Author.BOT, text: '' }]);

    try {
      // Use the SDK-typed parameters object for streaming.
      const stream = await chat.sendMessageStream({ message });
      let botResponse = '';
      for await (const chunk of stream) {
        if (stopGeneratingRef.current) {
          break;
        }
        // FIX: The streaming response is processed chunk by chunk (more robust
        // than character-by-character animation). The stream exposes `text` as
        // a getter property on each chunk.
        botResponse += chunk.text;
        setHistory(prev => {
          const newHistory = [...prev];
          const lastMessage = newHistory[newHistory.length - 1];
          if (lastMessage && lastMessage.author === Author.BOT) {
            lastMessage.text = botResponse;
          }
          return newHistory;
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      stopGeneratingRef.current = true;
      const errorMessage: Message = {
        author: Author.BOT,
        text: "Sorry, I couldn't get a response. Please check your connection or try again later.",
        isError: true,
      };
      setHistory(prev => {
        const newHistory = [...prev];
        // Replace the bot's placeholder with the styled error message
        if (newHistory.length > 0 && newHistory[newHistory.length - 1].author === Author.BOT) {
          newHistory[newHistory.length - 1] = errorMessage;
        } else {
          // Fallback in case the last message isn't a bot placeholder
          newHistory.push(errorMessage);
        }
        return newHistory;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setHistory([]);
    setChat(createChatSession());
  };

  if (!hasStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 p-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950 -z-10"></div>
        <div className="mb-8">
          <RobotIcon className="w-24 h-24 text-sky-400 animate-pulse-glow" />
        </div>
        <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-cyan-300 mb-4">
          Gemini Student Chatbot
        </h1>
        <p className="max-w-2xl text-lg text-slate-400 mb-10">
          Your personal AI-powered study partner. Ask me anything from complex calculus to literary analysis.
        </p>
        <button
          onClick={() => setHasStarted(true)}
          className="px-8 py-3 bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-semibold rounded-lg hover:opacity-90 transition-all duration-200 shadow-lg shadow-sky-500/20 transform hover:scale-105"
        >
          Start Chatting
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-950">
      <header className="flex items-center justify-between p-4 bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setHasStarted(false)}
            className="p-2 rounded-full text-slate-300 hover:bg-slate-700/50 transition-colors"
            aria-label="Back to home"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <RobotIcon className="w-6 h-6 text-sky-400"/>
            <h1 className="text-xl font-bold text-slate-200">Student Chatbot</h1>
          </div>
        </div>
        <button
          onClick={handleClearChat}
          className="px-4 py-2 text-sm font-medium bg-slate-700/80 text-slate-300 rounded-md hover:bg-slate-700 transition-colors"
        >
          Clear Chat
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto">
            {history.map((msg, index) => (
            <ChatMessage key={index} message={msg} />
            ))}
            <div ref={chatEndRef} />
        </div>
      </main>

      <div className="max-w-4xl mx-auto w-full">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} onStop={handleStopGenerating} />
      </div>
    </div>
  );
};

export default App;
