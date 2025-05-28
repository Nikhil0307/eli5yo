// app/page.tsx
'use client';

import { useState, FormEvent, useRef, useEffect } from 'react';

interface Message {
  id: string;
  type: 'user' | 'ai' | 'error';
  text: string;
}

// Simple unique ID generator
const generateId = () => Math.random().toString(36).substring(2, 9);

export default function ChatPage() {
  const [inputTopic, setInputTopic] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null); // For auto-scrolling

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]); // Scroll to bottom when messages change

  const handleSubmit = async (event?: FormEvent<HTMLFormElement>) => {
    if (event) event.preventDefault();
    const topicToSubmit = inputTopic.trim();

    if (!topicToSubmit) {
      setMessages(prev => [
        ...prev,
        { id: generateId(), type: 'error', text: "Please enter a topic to explain." }
      ]);
      return;
    }

    setIsLoading(true);
    setMessages(prev => [...prev, { id: generateId(), type: 'user', text: topicToSubmit }]);
    setInputTopic(''); // Clear input after submission

    try {
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topicToSubmit }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Request failed with status: ${response.status}`);
      }
      setMessages(prev => [...prev, { id: generateId(), type: 'ai', text: data.explanation }]);
    } catch (err: any) {
      console.error("Submission error:", err);
      setMessages(prev => [...prev, { id: generateId(), type: 'error', text: err.message || 'An unexpected error occurred.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Allow Enter to submit, Shift+Enter for newline
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto w-full">
      {/* Header (Optional, keeping it minimal) */}
      <header className="p-4 text-center border-b border-slate-700 sticky top-0 bg-slate-900/80 backdrop-blur-md z-10">
        <h1 className="text-xl font-semibold text-sky-400">ELI5<span className="text-slate-400">YO</span></h1>
      </header>

      {/* Messages Area */}
      <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.length === 0 && !isLoading && (
          <div className="text-center text-slate-500 pt-10">
            <p className="text-lg">Ask me to explain anything!</p>
            <p className="text-sm">e.g., "black holes", "how does the internet work?", "photosynthesis"</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] p-3 sm:p-4 rounded-xl shadow-md ${
                msg.type === 'user'
                  ? 'bg-sky-600 text-white rounded-br-none'
                  : msg.type === 'ai'
                  ? 'bg-slate-700 text-slate-200 rounded-bl-none prose prose-sm prose-invert max-w-none whitespace-pre-wrap'
                  : 'bg-red-800/70 text-red-200 border border-red-700 rounded-bl-none'
              }`}
            >
              {msg.type === 'ai' ? (
                <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }} /> // Basic newline handling
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length -1]?.type === 'user' && ( // Show loading indicator after user message
          <div className="flex justify-start">
            <div className="max-w-[80%] p-3 sm:p-4 rounded-xl shadow-md bg-slate-700 text-slate-200 rounded-bl-none">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-75"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-150"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-300"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} /> {/* Anchor for scrolling */}
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 p-3 sm:p-4 bg-slate-900/80 backdrop-blur-md border-t border-slate-700">
        <form onSubmit={handleSubmit} className="flex items-end space-x-2 sm:space-x-3">
          <textarea
            value={inputTopic}
            onChange={(e) => setInputTopic(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask ELI5YO to explain something..."
            rows={1} // Start with 1 row, auto-expands
            className="flex-grow p-3 bg-slate-700/60 border-2 border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-150 ease-in-out resize-none overflow-y-auto max-h-32" // max-h for scroll after few lines
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputTopic.trim()}
            className="p-3 bg-sky-600 hover:bg-sky-500 text-white rounded-lg disabled:opacity-50 disabled:hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-colors"
            aria-label="Send message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
              <path d="M3.105 3.105a1.5 1.5 0 012.122-.001L18.07 13.55a1.5 1.5 0 010 2.122L15.194 18.47a1.514 1.514 0 01-2.117.004L3.105 5.227a1.5 1.5 0 01-.001-2.122zM2.696 4.23A.5.5 0 002 4.5v11a.5.5 0 00.928.41l2.383-2.384L2.696 4.23z" />
            </svg>
          </button>
        </form>
         <p className="text-xs text-slate-500 mt-2 text-center">
            ⚠️ AI-generated. Verify important info. Shift+Enter for newline.
        </p>
      </div>
    </div>
  );
}
