import { NextResponse } from 'next/server';

import prismadb from '@/lib/prismadb';
import { currentUser } from '@clerk/nextjs/server';
import { checkSubscription } from '@/lib/subscription';

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

    const isPro = await checkSubscription();

    if (!isPro) {
      return new NextResponse('Pro subscription required', { status: 403 });
    }

    const companion = await prismadb.companion.update({
      where: { id: params.companionId, userId: user.id },
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

export async function DELETE(
  req: Request,
  { params }: { params: { companionId: string } }
) {
  try {
    const user = await currentUser();

    if (!params.companionId) {
      return new NextResponse('Missing companion ID', { status: 400 });
    }

    if (!user || !user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const companion = await prismadb.companion.delete({
      where: {
        userId: user.id,
        id: params.companionId
      }
    });

    return NextResponse.json(companion);
  } catch (error) {
    console.error('[COMPANION_DELETE]', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
