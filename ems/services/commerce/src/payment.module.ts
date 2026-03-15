import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PaymentEntity } from './entities/payment.entity';
import { PaymentTransactionEntity } from './entities/payment-transaction.entity';
import { RefundEntity } from './entities/refund.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentEntity, PaymentTransactionEntity, RefundEntity])],
  exports: [TypeOrmModule],
})
export class PaymentModule {}
