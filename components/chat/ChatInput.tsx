// app/components/chat/ChatInput.tsx
'use client';
import React, { FormEvent, useRef, useEffect } from 'react';
import styles from './ChatInput.module.css';
import { SendHorizonal, LoaderCircle } from 'lucide-react';

interface ChatInputProps {
  input: string;
  setInput: (input: string) => void;
  handleSubmit: (eventOrValue?: FormEvent<HTMLFormElement> | string) => Promise<void>;
  isLoading: boolean;
}

export default function ChatInput({ input, setInput, handleSubmit, isLoading }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim()) {
      handleSubmit(input);
    }
  };

  const handleTextareaKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !isLoading) {
      event.preventDefault();
      if (input.trim()) {
        handleSubmit(input);
      }
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 160; // Approx 10rem
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [input]);

  return (
    <div className={styles.inputAreaOuter}>
      <div className={styles.inputAreaInner}>
        <form onSubmit={handleFormSubmit} className={styles.inputForm}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleTextareaKeyDown}
            placeholder="Send a message..."
            rows={1}
            className={styles.inputTextarea}
            disabled={isLoading}
            aria-label="Chat message input"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={styles.sendButton}
            aria-label="Send message"
          >
            {isLoading ? (
              <LoaderCircle size={20} className={styles.loadingSpinnerIcon} />
            ) : (
              <SendHorizonal size={20} />
            )}
          </button>
        </form>

        <p className={styles.footerDisclaimer}>
          ELI5YO may produce inaccurate information.
        </p>

        <div className={styles.customFooter}>
          <p>
            Made with ♥️ by Nikhil
          </p>
          <div className={styles.footerLinksContainer}>
            <a
              href="https://ko-fi.com/K3K81FOHEA" // Your Ko-fi ID
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.footerLink} ${styles.kofiLink}`}
            >
              Buy Me a ☕️
            </a>
            <span className={styles.linkSeparator}>•</span>
            <a
              href="https://www.linkedin.com/in/nikhil0307/" // Your LinkedIn
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.footerLink} ${styles.linkedinLink}`}
            >
              LinkedIn
            </a>
            <span className={styles.linkSeparator}>•</span>
            <a
              href="https://nikhil-baskar.dev/" // Your Portfolio
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.footerLink} ${styles.portfolioLink}`}
            >
              Portfolio
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
