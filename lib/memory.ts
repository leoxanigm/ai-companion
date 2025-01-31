import { Redis } from '@upstash/redis';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Index, Pinecone, RecordMetadata } from '@pinecone-database/pinecone';
import { PineconeStore } from '@langchain/pinecone';

export type CompanionKey = {
  companionName: string;
  modelName: string;
  userId: string;
};

export class MemoryManager {
  private static instance: MemoryManager;
  private history: Redis;
  private vectorDBClient: Pinecone;
  // private index: Index<RecordMetadata>;

  public constructor() {
    this.history = Redis.fromEnv();
    this.vectorDBClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
  }

  // public async init() {
  //   if (this.vectorDBClient instanceof Pinecone) {
  //     this.index = this.vectorDBClient.index(process.env.PINECONE_INDEX!)
  //   }
  // }

  public async vectorSearch(
    recentChatHistory: string,
    companionFileName: string
  ) {
    const pineconeIndex = this.vectorDBClient.index(
      process.env.PINECONE_INDEX!
    );

    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY }),
      { pineconeIndex }
    );

    const similarDocs = await vectorStore
      .similaritySearch(recentChatHistory, 3, { fileName: companionFileName })
      .catch((error) => {
        console.error('Failed to get vector search results', error);
      });

    return similarDocs;
  }

  public static async getInstance(): Promise<MemoryManager> {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }

    return MemoryManager.instance;
  }

  private generateRedisCompanionKey(companionKey: CompanionKey): string {
    return `${companionKey.companionName}-${companionKey.modelName}-${companionKey.userId}`;
  }

  public async writeToHistory(text: string, companionKey: CompanionKey) {
    if (!companionKey || typeof companionKey.userId === 'undefined') {
      console.error('Companion key is incorrectly set!');

      return '';
    }

    const key = this.generateRedisCompanionKey(companionKey);
    const result = await this.history.zadd(key, {
      score: Date.now(),
      member: text,
    });

    return result;
  }

  private async readLatestHistory(companionKey: CompanionKey): Promise<string> {
    if (!companionKey || typeof companionKey.userId === 'undefined') {
      console.error('Companion key is incorrectly set!');

      return '';
    }

    const key = this.generateRedisCompanionKey(companionKey);
    let result = await this.history.zrange(key, 0, Date.now(), {
      byScore: true,
    });

    result = result.slice(-30).reverse();
    const recentChats = result.reverse().join('\n');

    return recentChats;
  }

  public async seedChatHistory(
    seedContent: string,
    companionKey: CompanionKey,
    delimiter: string = '\n'
  ) {
    const key = this.generateRedisCompanionKey(companionKey);

    if (await this.history.exists(key)) {
      console.log('User already has a chat history');
      return;
    }

    const content = seedContent.split(delimiter);
    let counter = 0;

    for (const line of content) {
      await this.history.zadd(key, { score: counter, member: line });
      counter++;
    }
  }
}