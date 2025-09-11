import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Author, ChatMessage as Message } from '../types';
import { RobotIcon } from './icons/RobotIcon';
import { UserIcon } from './icons/UserIcon';
import LoadingSpinner from './LoadingSpinner';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';

interface ChatMessageProps {
  message: Message;
}

const CodeBlock: React.FC<{ language: string; value: string }> = ({ language, value }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  return (
    <div className="relative group my-2 text-sm">
      <button
        onClick={handleCopy}
        aria-label="Copy code"
        className="absolute top-2 right-2 p-1.5 bg-slate-700/80 rounded-md text-slate-300 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200 hover:bg-slate-600"
      >
        {isCopied ? (
          <CheckIcon className="w-4 h-4 text-green-400" />
        ) : (
          <CopyIcon className="w-4 h-4" />
        )}
      </button>
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={language}
        PreTag="div"
        customStyle={{ margin: 0, borderRadius: '0.5rem', background: '#1e293b' }}
        codeTagProps={{
            style: {
                fontFamily: 'inherit'
            }
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
};


const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.author === Author.USER;
  const isError = message.isError;

  const avatar = isUser ? (
    <div className="w-8 h-8 rounded-full bg-slate-700 ring-2 ring-slate-600 flex items-center justify-center text-white flex-shrink-0">
      <UserIcon className="w-5 h-5" />
    </div>
  ) : (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isError ? 'bg-red-800 ring-2 ring-red-500/50 text-red-400' : 'bg-slate-800 ring-2 ring-sky-500/50 text-sky-400'}`}>
       {isError ? <ExclamationTriangleIcon className="w-5 h-5" /> : <RobotIcon className="w-5 h-5" />}
    </div>
  );

  const messageBoxClasses = isUser
    ? 'bg-gradient-to-br from-sky-600 to-cyan-600 text-white'
    : isError
    ? 'bg-red-900/50 text-red-300 ring-1 ring-red-700/50'
    : 'bg-slate-800 text-slate-300 ring-1 ring-slate-700/50';

  return (
    <div className={`flex items-start gap-3 my-4 ${isUser ? 'flex-row-reverse' : ''}`}>
      {avatar}
      <div className={`px-4 py-3 rounded-xl max-w-lg ${messageBoxClasses}`}>
        {isUser ? (
          <div className="whitespace-pre-wrap">{message.text}</div>
        ) : isError ? (
           <div className="flex items-center gap-2">
             <p>{message.text}</p>
          </div>
        ) : message.text ? (
          <article className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // FIX: Add 'any' type to props to fix TypeScript error about missing 'inline' property.
                // This is a workaround for a potential type definition mismatch in react-markdown.
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <CodeBlock
                      language={match[1]}
                      value={String(children).replace(/\n$/, '')}
                      {...props}
                    />
                  ) : (
                    <code className="bg-slate-700/80 text-sky-300 px-1.5 py-0.5 rounded-md font-mono text-sm mx-0.5" {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {message.text}
            </ReactMarkdown>
          </article>
        ) : (
          <LoadingSpinner />
        )}
      </div>
    </div>
  );
};

export default ChatMessage;