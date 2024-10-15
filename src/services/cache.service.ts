import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient } from 'redis';

@Injectable()
export class CacheService implements OnModuleInit {
  private client;
  private readonly expirationTime = Number(process.env.EXPIRATION_TIME);
  private lastUpdateTime: number;

  async onModuleInit() {
    this.client = createClient({
      url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    });
    console.log(`redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`);

    await this.client.connect({
      url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    });

    console.log('Connected to Redis');
    this.lastUpdateTime = Date.now();
  }

  async setLastBlockNumber(number: number): Promise<void> {
    await this.client.set(
      'lastBlockNumber',
      number.toString(),
      'EX',
      this.expirationTime,
    );
  }

  async getLastBlockNumber(): Promise<number | null> {
    const blockNumber = await this.client.get('lastBlockNumber');
    return blockNumber ? parseInt(blockNumber, 10) : null;
  }

  async addBlock(block: {
    number: number;
    transactions: any[];
  }): Promise<void> {
    const blockKey = `block:${block.number}`;
    const transactions = JSON.stringify(block.transactions);
    await this.client.set(blockKey, transactions, 'EX', this.expirationTime);
  }

  async getBlock(
    number: number,
  ): Promise<{ number: number; transactions: any[] } | undefined> {
    const blockKey = `block:${number}`;
    const transactions = await this.client.get(blockKey);
    return transactions
      ? { number, transactions: JSON.parse(transactions) }
      : undefined;
  }

  async getLastBlocks(
    count: number,
  ): Promise<{ number: number; transactions: any[] }[]> {
    const keys = await this.client.keys('block:*');
    const sortedKeys = keys.sort().slice(-count);

    const blocks = await Promise.all(
      sortedKeys.map(async (key) => {
        const transactions = await this.client.get(key);
        const number = parseInt(key.split(':')[1], 10);
        return { number, transactions: JSON.parse(transactions) };
      }),
    );

    return blocks;
  }

  shouldUpdateCache(): boolean {
    return Date.now() - this.lastUpdateTime > 10000;
  }

  updateLastUpdateTime(): void {
    this.lastUpdateTime = Date.now();
  }
}
