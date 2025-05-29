// app/page.tsx
'use client';

import { useState, FormEvent, useRef, useEffect, useCallback } from 'react';
import styles from './ChatInterface.module.css';
import ChatMessage from '../components/chat/ChatMessage';
import ChatInput from '../components/chat/ChatInput';
import { ThemeToggleButton, useTheme } from './contexts/ThemeContext';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'error';
  content: string;
  createdAt?: Date;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (messages.length > 0 || isLoading) {
        scrollToBottom();
    }
  }, [messages, isLoading, scrollToBottom]);

  const handleSubmit = async (eventOrValue?: FormEvent<HTMLFormElement> | string) => {
    let topicToSubmit: string;
    if (typeof eventOrValue === 'string') {
      topicToSubmit = eventOrValue;
    } else {
      if (eventOrValue) eventOrValue.preventDefault();
      topicToSubmit = input;
    }

    topicToSubmit = topicToSubmit.trim();
    if (!topicToSubmit) return;

    setIsLoading(true);
    const userMessage: Message = { id: generateId(), role: 'user', content: topicToSubmit, createdAt: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput(''); // Clear input state

    try {
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topicToSubmit }),
      });

      if (!response.ok) {
        let errorPayload;
        let errorMessage = `Error: ${response.status} ${response.statusText || 'Failed to fetch'}`;
        try {
          errorPayload = await response.json();
          if (errorPayload && errorPayload.error) errorMessage = errorPayload.error;
        } catch (jsonError) {
          console.error("Error response not JSON:", await response.text().catch(() => "Non-JSON error"));
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (data.explanation) {
        const aiMessage: Message = { id: generateId(), role: 'assistant', content: data.explanation, createdAt: new Date() };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error("Response OK, but no explanation found.");
      }
    } catch (err: any) {
      console.error("Submit Error:", err);
      const errorMsg: Message = { id: generateId(), role: 'error', content: err.message || 'Unexpected error.', createdAt: new Date() };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const exampleMessages = [
    { heading: "Explain a concept", message: "What is recursion in programming?" },
    { heading: "Summarize a topic", message: "Tell me about the Big Bang theory." },
    { heading: "Compare two things", message: "What's the difference between AI and Machine Learning?" },
    { heading: "Explain a term", message: "What does 'Quantum Entanglement' mean?" },
  ];

  return (
    <div className={styles.chatPageContainer}>
      <div className={styles.chatPanel}> {/* This panel is full-width */}
        <header className={styles.chatHeader}>
          <div className={styles.headerContentWrapper}> {/* Inner wrapper for centering header content */}
            <h1 className={styles.chatTitle}>ELI5<span className={styles.chatTitleYo}>YO</span></h1>
            <ThemeToggleButton />
          </div>
        </header>

        <div className={styles.messagesArea} id="messages-area">
          {messages.length === 0 && !isLoading && (
            <div className={styles.emptyStateContainer}>
              <div className={styles.emptyStateContentWrapper}> {/* Inner wrapper for centering empty state content */}
                <h2 className={styles.emptyStateTitle}>Explain Like I'm Five</h2>
                <p className={styles.emptyStateSubtitle}>Your friendly AI-powered explainer.</p>
                <div className={styles.examplePromptsGrid}>
                  {exampleMessages.map((ex, index) => (
                    <button
                      key={index}
                      className={styles.examplePromptButton}
                      onClick={() => handleSubmit(ex.message) }
                      title={`Explain: ${ex.message}`}
                      disabled={isLoading}
                    >
                      <div className={styles.examplePromptHeading}>{ex.heading}</div>
                      <div className={styles.examplePromptMessage}>{ex.message}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((msg, index) => (
            <ChatMessage key={msg.id || index} message={msg} />
          ))}

          {isLoading && (
            // This loading indicator will also be centered by ChatMessage.module.css if we style it as a message row
            // For now, using the one defined in ChatInterface.module.css
            <div className={`${styles.loadingDotsContainer} ${styles.isWithinMessages}`}>
                <div className={styles.dot}></div>
                <div className={styles.dot}></div>
                <div className={styles.dot}></div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* ChatInput component handles its own inner content centering */}
        <ChatInput
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
