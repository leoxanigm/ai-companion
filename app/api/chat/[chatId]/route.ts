import { streamText, LangChainAdapter } from 'ai';
import { auth, currentUser } from '@clerk/nextjs/server';
import { CallbackManager } from '@langchain/core/callbacks/manager';
import { Replicate } from '@langchain/community/llms/replicate';
import { NextResponse } from 'next/server';

import { MemoryManager } from '@/lib/memory';
import { rateLimit } from '@/lib/rate-limit';
import prismadb from '@/lib/prismadb';

export async function POST(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const { prompt } = await req.json();
    const user = await currentUser();
    const { chatId } = await params;

    if (!user || !user.id || !user.username) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const identifier = req.url + '-' + user.id;
    const { success } = await rateLimit(identifier);

    if (!success) {
      return new NextResponse('Rate Limit Exceeded', { status: 429 });
    }

    const companion = await prismadb.companion.update({
      where: {
        id: chatId
      },
      data: {
        messages: {
          create: {
            content: prompt,
            role: 'user',
            userId: user.id
          }
        }
      }
    });

    if (!companion) {
      return new NextResponse('Companion not Found', { status: 404 });
    }

    const name = companion.name;
    const companionFileName = `companion-${name}.txt`;

    const companionKey = {
      companionName: name,
      userId: user.id,
      modelName: 'llama2-13b'
    };

    const memoryManager = await MemoryManager.getInstance();

    const records = await memoryManager.readLatestHistory(companionKey);

    if (records.length === 0) {
      await memoryManager.seedChatHistory(companion.seed, companionKey, '\n\n');
    }

    await memoryManager.writeToHistory(`User: ${prompt}\n`, companionKey);

    const recentChatHistory = await memoryManager.readLatestHistory(
      companionKey
    );

    const similarDocs = await memoryManager.vectorSearch(
      recentChatHistory,
      companionFileName
    );

    let relevantHistory = '';
    if (!!similarDocs && similarDocs.length > 0) {
      relevantHistory = similarDocs.map(doc => doc.pageContent).join('\n');
    }

    // const {handlers} = LangChainStream();

    const model = new Replicate({
      // @ts-ignore:
      model:
        'ibm-granite/granite-3.1-8b-instruct:0261a65b61b38d0cbd5c484ea566a22ce6b2dfad92cb6d8f5b24ffca1f5c3814',
      // model: 'deepseek-ai/deepseek-r1',
      // input: { max_length: 2028 },
      apiKey: process.env.REPLICATE_API_TOKEN
      // callbacks: CallbackManager.fromHandlers(LangChainAdapter.toDataStream)
    });

    model.verbose = true;

    const res = String(
      await model
        .invoke(
          `
          ONLY generate plain sentences without prefix of who is speaking. DO NOT use ${name}: prefix.
          ${companion.instructions}
          Below are the relevant details about ${name}'s past and the conversation you are in.
          Only respond to questions related to the previous instructions. For any other unrelated questions, respond with "I am not sure about that."
          ${relevantHistory}
          ${recentChatHistory}
          ${name}:
          `
        )
        .catch(error => console.error('Failed to generate response', error))
    );

    const cleaned = res.replace(',', '');
    const chunks = cleaned.split('\n');
    const response = chunks[0].trim();

    if (response !== undefined && response.length > 1) {
      await memoryManager.writeToHistory(response, companionKey);

      await prismadb.companion.update({
        where: {
          id: chatId
        },
        data: {
          messages: {
            create: {
              content: response,
              role: 'system',
              userId: user.id
            }
          }
        }
      });
    }

    return new NextResponse(response, { status: 200 });
  } catch (error) {
    console.error('[CHAT POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
