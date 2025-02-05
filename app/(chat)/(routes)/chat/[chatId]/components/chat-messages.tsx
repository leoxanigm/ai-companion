'use client';

import { ComponentRef, use, useEffect, useRef, useState } from 'react';

import { Companion } from '@prisma/client';
import ChatMessage, { ChatMessageProps } from './chat-message';

interface ChatMessagesProps {
  companion: Companion;
  messages: ChatMessageProps[];
  isLoading: boolean;
}

const ChatMessages = ({
  companion,
  messages,
  isLoading
}: ChatMessagesProps) => {
  // Fake loading for the introductory message if there are no previous messages
  const [fakeLoading, setFakeLoading] = useState(messages.length === 0);
  const scrollRef = useRef<ComponentRef<'div'>>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setFakeLoading(false), 500);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    scrollRef?.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  return (
    <div className='flex-1 overflow-y-auto pr-4'>
      <ChatMessage
        isLoading={fakeLoading}
        src={companion.src}
        role='system'
        content={`Hello, I am ${companion.name}, ${companion.description}`}
      />
      {messages.map(message => (
        <ChatMessage
          key={message.id}
          role={message.role}
          content={message.content}
          src={companion.src}
        />
      ))}
      {isLoading && <ChatMessage isLoading role='system' src={companion.src} />}
      <div ref={scrollRef}></div>
    </div>
  );
};

export default ChatMessages;
