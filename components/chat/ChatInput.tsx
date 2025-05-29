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

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height to shrink if text is deleted
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 160; // approx 10rem or 5-6 lines (CSS defined max-height)
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [input]); // Re-run when input changes

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
      </div>
    </div>
  );
}
