import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Product } from '../products/entities/product.entity';
import { CouponsModule } from '../coupons/coupons.module';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { Transaction, TransactionContents } from './entities/transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, TransactionContents, Product]),
    CouponsModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
