// app/components/chat/ChatMessage.tsx
'use client';
import type { Message } from '@/types/index'; 
import styles from './ChatMessage.module.css';
import { User, BotMessageSquare, AlertTriangle } from 'lucide-react'; // Using specific icons

// Helper function to format message content (basic newline handling)
const formatContent = (content: string) => {
  return content.split('\n').map((line, index, array) => (
    <span key={index}>
      {line}
      {index < array.length - 1 && <br />}
    </span>
  ));
};

export default function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  const isError = message.role === 'error';
  const isSystem = message.role === 'system'; // Though not explicitly used in bubble styles yet

  let IconComponent = BotMessageSquare;
  let avatarClass = styles.avatarAssistant;
  let bubbleClass = styles.bubbleAssistant;

  if (isUser) {
    IconComponent = User;
    avatarClass = styles.avatarUser;
    bubbleClass = styles.bubbleUser;
  } else if (isError) {
    IconComponent = AlertTriangle;
    avatarClass = styles.avatarError;
    bubbleClass = styles.bubbleError;
  }
  // Add system style if needed

  return (
    <div className={`${styles.messageRow} ${isUser ? styles.messageRowUser : styles.messageRowAssistant}`}>
      <div className={`${styles.avatar} ${avatarClass}`}>
        <IconComponent size={18} strokeWidth={2} /> {/* Adjusted icon size/stroke */}
      </div>
      <div className={`${styles.messageContentWrapper}`}>
        <div className={`${styles.bubble} ${bubbleClass}`}>
          {formatContent(message.content)}
        </div>
        {/* Optional: Timestamp or other metadata
        {message.createdAt && (
          <div className={styles.timestamp}>
            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )} */}
      </div>
    </div>
  );
}
