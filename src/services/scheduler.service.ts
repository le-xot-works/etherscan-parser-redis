import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EtherScanService } from './etherscan.service';
import { CacheService } from './cache.service';

@Injectable()
export class SchedulerService implements OnModuleInit {
  private readonly maxRequestsPerSecond = Number(
    process.env.MAX_REQUESTS_PER_SECOND,
  );
  private readonly requestInterval = 1000 / this.maxRequestsPerSecond;

  constructor(
    private readonly blockchainService: EtherScanService,
    private readonly cacheService: CacheService,
  ) {}

  onModuleInit() {
    this.updateBlocks().catch(console.error);
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async updateBlocks() {
    if (!this.cacheService.shouldUpdateCache()) {
      return;
    }

    try {
      const lastBlockNumber = await this.blockchainService.getLastBlockNumber();
      this.cacheService.setLastBlockNumber(lastBlockNumber);

      for (let i = lastBlockNumber; i > lastBlockNumber - 100; i--) {
        await this.processBlock(i);
        await this.delayRequest();
      }

      this.cacheService.updateLastUpdateTime();
    } catch (error) {
      console.error('Failed to update blocks:', error.message);
    }
  }

  private async processBlock(blockNumber: number) {
    const cachedBlock = await this.cacheService.getBlock(blockNumber);
    if (!cachedBlock) {
      await this.blockchainService.getBlockTransactions(blockNumber);
    }
  }

  private async delayRequest() {
    return new Promise((resolve) => setTimeout(resolve, this.requestInterval));
  }
}
