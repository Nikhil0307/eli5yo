// app/page.tsx
'use client';
import { useState, FormEvent, useRef, useEffect } from 'react';
import styles from './ChatPage.module.css'; // Import the CSS Module

interface Message { /* ... */ }
const generateId = () => Math.random().toString(36).substring(2, 9);

export default function ChatPage() {
  const [inputTopic, setInputTopic] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => { /* ... */ };
  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (event?: FormEvent<HTMLFormElement>) => {
    if (event) event.preventDefault();
    const topicToSubmit = inputTopic.trim();
    if (!topicToSubmit) {
      setMessages(prev => [...prev, { id: generateId(), type: 'error', text: "Please enter a topic to explain." }]);
      return;
    }
    setIsLoading(true);
    setMessages(prev => [...prev, { id: generateId(), type: 'user', text: topicToSubmit }]);
    setInputTopic('');
    try {
      const response = await fetch('/api/explain', { /* ... */ });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Request failed: ${response.status}`);
      setMessages(prev => [...prev, { id: generateId(), type: 'ai', text: data.explanation }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { id: generateId(), type: 'error', text: err.message || 'Unexpected error.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => { /* ... */ };

  return (
    <div className={styles.chatPageContainer}>
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>
          ELI5<span className={styles.headerTitleYo}>YO</span>
        </h1>
      </header>

      <div className={styles.messagesArea}>
        {messages.length === 0 && !isLoading && (
          <div className={styles.initialMessage}>
            <p className={styles.initialMessageLarge}>Ask me to explain anything!</p>
            <p className={styles.initialMessageSmall}>e.g., "black holes", "how does the internet work?"</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={msg.type === 'user' ? styles.userMessageContainer : styles.aiMessageContainer}>
            <div
              className={
                msg.type === 'user' ? styles.userMessage :
                msg.type === 'ai'   ? styles.aiMessage :
                                      styles.errorMessage
              }
            >
              {msg.type === 'ai' ? (
                <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }} />
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length -1]?.type === 'user' && (
          <div className={styles.loadingIndicatorContainer}>
            <div className={styles.loadingIndicator}>
              <div className={styles.dots}>
                <div className={styles.dot}></div>
                <div className={styles.dot}></div>
                <div className={styles.dot}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputArea}>
        <form onSubmit={handleSubmit} className={styles.inputForm}>
          <textarea
            value={inputTopic}
            onChange={(e) => setInputTopic(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask ELI5YO to explain something..."
            rows={1}
            className={styles.inputTextarea}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputTopic.trim()}
            className={styles.submitButton}
            aria-label="Send message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 sm:w-6 sm:h-6"> {/* SVG classes are not module-based */}
              <path d="M3.105 3.105a1.5 1.5 0 012.122-.001L18.07 13.55a1.5 1.5 0 010 2.122L15.194 18.47a1.514 1.514 0 01-2.117.004L3.105 5.227a1.5 1.5 0 01-.001-2.122zM2.696 4.23A.5.5 0 002 4.5v11a.5.5 0 00.928.41l2.383-2.384L2.696 4.23z" />
            </svg>
          </button>
        </form>
        <p className={styles.footerDisclaimer}>
          ⚠️ AI-generated. Verify important info. Shift+Enter for newline.
        </p>
      </div>
    </div>
  );
}
