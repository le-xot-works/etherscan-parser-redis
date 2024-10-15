import { Injectable } from '@nestjs/common';
import { CacheService } from './cache.service';

@Injectable()
export class EtherScanService {
  private readonly apiKey = process.env.API_KEY;
  private readonly baseUrl = process.env.BASE_URL;

  constructor(private readonly cacheService: CacheService) {}

  private getApiUrl(endpoint: string, params: string = ''): string {
    return `${this.baseUrl}?module=proxy&action=${endpoint}&${params}&apikey=${this.apiKey}`;
  }

  async getLastBlockNumber(): Promise<number> {
    const cachedLastBlock = await this.cacheService.getLastBlockNumber();
    if (cachedLastBlock !== null && !this.cacheService.shouldUpdateCache()) {
      return cachedLastBlock;
    }

    try {
      const url = this.getApiUrl('eth_blockNumber');
      const response = await this.httpGet(url);
      const blockNumber = parseInt(response.result, 16);
      await this.cacheService.setLastBlockNumber(blockNumber);
      this.cacheService.updateLastUpdateTime();
      return blockNumber;
    } catch (error) {
      throw new Error(`Failed to fetch last block number: ${error.message}`);
    }
  }

  async getBlockTransactions(blockNumber: number): Promise<any[]> {
    const cachedBlock = await this.cacheService.getBlock(blockNumber);

    if (cachedBlock) {
      return cachedBlock.transactions;
    }

    try {
      const url = this.getApiUrl(
        'eth_getBlockByNumber',
        `tag=${'0x' + blockNumber.toString(16)}&boolean=true`,
      );
      const response = await this.httpGet(url);
      const { number, transactions } = response.result;
      await this.cacheService.addBlock({
        number: parseInt(number, 16),
        transactions,
      });
      return transactions;
    } catch (error) {
      throw new Error(`Failed to fetch block transactions: ${error.message}`);
    }
  }

  private async httpGet(url: string): Promise<any> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to fetch: ${error.message}`);
    }
  }
}
