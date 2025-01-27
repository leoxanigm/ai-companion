import { NextResponse } from 'next/server';

import prismadb from '@/lib/prismadb';
import { currentUser } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const user = await currentUser();
    const { src, name, description, instructions, seed, categoryId } = body;

    if (!user || !user.id || !user.username) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (
      ![src, name, description, instructions, seed, categoryId].every(Boolean)
    ) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // TODO: check for subscription status

    const companion = await prismadb.companion.create({
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
