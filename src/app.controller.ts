import { Controller, Get } from '@nestjs/common';
import { BalanceService } from './services/balance.service';

@Controller('/api')
export class AppController {
  constructor(private readonly balanceService: BalanceService) {}

  @Get('/max-balance-change')
  async getMaxBalanceChange() {
    const result = await this.balanceService.getMaxBalanceChange();
    return result;
  }
}
