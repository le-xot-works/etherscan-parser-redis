import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { EtherScanService } from './services/etherscan.service';
import { BalanceService } from './services/balance.service';
import { CacheService } from './services/cache.service';
import { SchedulerService } from './services/scheduler.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [AppController],
  providers: [EtherScanService, BalanceService, CacheService, SchedulerService],
})
export class AppModule {}
