import { Injectable } from '@nestjs/common';
import { CacheService } from './cache.service';

@Injectable()
export class BalanceService {
  constructor(private readonly cacheService: CacheService) {}

  async getMaxBalanceChange(): Promise<{ address: string | null }> {
    const lastBlocks = await this.cacheService.getLastBlocks(100);

    const balances = new Map<string, bigint>();

    for (const block of lastBlocks) {
      const transactions = block.transactions;
      for (const tx of transactions) {
        const value = BigInt(tx.value);
        const fromBalance = balances.get(tx.from) ?? 0n;
        balances.set(tx.from, fromBalance - value);
        const toBalance = balances.get(tx.to) ?? 0n;
        balances.set(tx.to, toBalance + value);
      }
    }

    let maxChangeAddress: string | null = null;
    let maxChange: bigint = 0n;

    for (const [address, balance] of balances.entries()) {
      const absChange = balance < 0n ? -balance : balance;
      if (absChange > maxChange) {
        maxChange = absChange;
        maxChangeAddress = address;
      }
    }

    // const maxChanged = [...balances.entries()].reduce(
    //   ({ address, change }, [currentAddress, currentChange]) => {
    //     if (currentChange > change) {
    //       address = currentAddress;
    //       change = currentChange;
    //     }
    //     return { address, change };
    //   },
    //   <{ address: string | null; change: bigint }>{
    //     address: null,
    //     change: 0n,
    //   },
    // );

    return { address: maxChangeAddress };
  }
}
