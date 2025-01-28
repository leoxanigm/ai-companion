import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import prismadb from '@/lib/prismadb';
import ChatClient from './components/chat-client';

interface ChatIdPageProps {
  params: {
    chatId: string;
  };
}

const ChatIdPage = async ({ params }: ChatIdPageProps) => {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) return redirectToSignIn();

  const { chatId } = await params;

  const companion = await prismadb.companion.findUnique({
    where: {
      id: chatId
    },
    include: {
      messages: {
        orderBy: {
          createdAt: 'asc'
        },
        where: {
          userId
        }
      },
      _count: {
        select: {
          messages: true
        }
      }
    }
  });

  if (!companion) return redirect('/');

  return <ChatClient companion={companion} />;
};

export default ChatIdPage;
