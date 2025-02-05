'use client';

import { FormEvent, useState } from 'react';
import { Companion, Message } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useCompletion } from 'ai/react';

import ChatHeader from './chat-header';
import ChatForm from './chat-form';
import ChatMessages from './chat-messages';
import { ChatMessageProps } from './chat-message';
import { v4 as uuid } from 'uuid';

interface ChatClientProps {
  companion: Companion & {
    messages: Message[];
    _count: {
      messages: number;
    };
  };
}

const ChatClient = ({ companion }: ChatClientProps) => {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessageProps[]>(
    companion.messages
  );

  const { input, isLoading, handleInputChange, handleSubmit, setInput } =
    useCompletion({
      api: `/api/chat/${companion.id}`,
      // onFinish(prompt, completion) {
      //   console.log("prompt", prompt);
      //   const systemMessage: ChatMessageProps = {
      //     role: 'system',
      //     content: completion
      //   };

      //   setMessages(current => [...current, systemMessage]);
      //   setInput('');

      //   router.refresh(); // Check if this is needed
      // }
      async onResponse(response) {
        const content = await response.text();
        const systemMessage: ChatMessageProps = {
          id: uuid(),
          role: 'system',
          content
        };

        setMessages(current => [...current, systemMessage]);
        setInput('');
      }
    });

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    const userMessage: ChatMessageProps = {
      id: uuid(),
      role: 'user',
      content: input
    };

    // Generate uuid to be used as temporary key
    setMessages(current => [...current, userMessage]);
    handleSubmit(e);
  };

  return (
    <div className='flex flex-col h-full p-4 space-y-2'>
      <ChatHeader companion={companion} />
      <ChatMessages
        companion={companion}
        isLoading={isLoading}
        messages={messages}
      />
      <ChatForm
        isLoading={isLoading}
        input={input}
        handleInputChange={handleInputChange}
        onSubmit={onSubmit}
      />
    </div>
  );
};

export default ChatClient;
