import { NextResponse } from 'next/server';

import prismadb from '@/lib/prismadb';
import { currentUser } from '@clerk/nextjs/server';

export async function PATCH(
  req: Request,
  { params }: { params: { companionId: string } }
) {
  try {
    const body = await req.json();
    const user = await currentUser();
    const { src, name, description, instructions, seed, categoryId } = body;

    if (!params.companionId) {
      return new NextResponse('Missing companion ID', { status: 400 });
    }

    if (!user || !user.id || !user.username) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (
      ![src, name, description, instructions, seed, categoryId].every(Boolean)
    ) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // TODO: check for subscription status

    const companion = await prismadb.companion.update({
      where: { id: params.companionId },
      data: {
        categoryId,
        userId: user.id,
        userName: user.username,
        src,
        name,
        description,
        instructions,
        seed
      }
    });

    return NextResponse.json(companion);
  } catch (error) {
    console.error('[COMPANION_POST]', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
