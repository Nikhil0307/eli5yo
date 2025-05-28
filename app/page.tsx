// app/page.tsx
'use client';

import { useState, FormEvent, useRef, useEffect } from 'react';
import styles from './ChatPage.module.css'; // Assuming you have this CSS Module

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
    // Add user message immediately
    setMessages(prev => [...prev, { id: generateId(), type: 'user', text: topicToSubmit }]);
    setInputTopic(''); // Clear input after submission

    try {
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topicToSubmit }),
      });

      if (!response.ok) {
        // Attempt to parse the error response body as JSON first
        let errorPayload;
        let errorMessage = `Error: ${response.status} ${response.statusText || 'Failed to fetch explanation'}`;
        try {
          errorPayload = await response.json();
          if (errorPayload && errorPayload.error) {
            errorMessage = errorPayload.error; // Use the error message from our API if available
          }
        } catch (jsonError) {
          // If the error response wasn't JSON, log it (could be HTML)
          // and stick with the status-based error message.
          console.error("Error response was not JSON:", await response.text().catch(() => "Could not read error response text."));
        }
        throw new Error(errorMessage);
      }

      // If response.ok is true, then we expect valid JSON
      const data = await response.json();
      if (data.explanation) {
        setMessages(prev => [...prev, { id: generateId(), type: 'ai', text: data.explanation }]);
      } else {
        // Handle cases where response is OK but explanation is missing (shouldn't happen with current API)
        throw new Error("Received a response, but no explanation was found.");
      }

    } catch (err: any) {
      console.error("Submission error in handleSubmit:", err);
      setMessages(prev => [...prev, { id: generateId(), type: 'error', text: err.message || 'An unexpected error occurred while fetching the explanation.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Allow Enter to submit, Shift+Enter for newline
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !isLoading) { // Prevent multiple submits while loading
      event.preventDefault();
      handleSubmit();
    }
  };

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
            <p className={styles.initialMessageSmall}>e.g., "black holes", "how does the internet work?", "photosynthesis"</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={
            msg.type === 'user' ? styles.userMessageContainer :
            msg.type === 'ai'   ? styles.aiMessageContainer :
                                  styles.errorMessageContainer // Assuming you have styles for error container
          }>
            <div
              className={
                msg.type === 'user' ? styles.userMessage :
                msg.type === 'ai'   ? styles.aiMessage :
                                      styles.errorMessage // This class should style the error message bubble
              }
            >
              {msg.type === 'ai' ? (
                // A more robust way to handle multiline text than dangerouslySetInnerHTML
                // would be to split by newline and render <p> tags or use whitespace-pre-wrap.
                // For now, keeping it simple but be mindful of XSS if LLM output is not sanitized.
                <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }} />
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}
        {isLoading && messages.length > 0 && messages[messages.length -1]?.type === 'user' && (
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
            aria-label="Topic to explain"
          />
          <button
            type="submit"
            disabled={isLoading || !inputTopic.trim()}
            className={styles.submitButton}
            aria-label="Send message"
          >
            {/* Send Icon SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{width: '1.25rem', height: '1.25rem'}}>
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
