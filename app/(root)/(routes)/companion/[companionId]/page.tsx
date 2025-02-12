import { auth } from '@clerk/nextjs/server';

import prismadb from '@/lib/prismadb';
import CompanionForm from './components/companion-form';

interface CompanionIdPageProps {
  params: {
    companionId: string;
  };
}

const CompanionIdPage = async ({ params }: CompanionIdPageProps) => {
  // TODO: check subscription status

  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    redirectToSignIn();
  }

  const companionId = (await params).companionId;
  const companion = await prismadb.companion.findUnique({
    where: {
      id: companionId,
      userId: userId as string, // Weird TypeScript error
    }
  });

  const categories = await prismadb.category.findMany();

  return <CompanionForm initialData={companion} categories={categories} />;
};

export default CompanionIdPage;
