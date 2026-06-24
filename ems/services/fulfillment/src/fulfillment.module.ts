import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fulfillment } from './entities/fulfillment.entity';
import { FulfillmentService } from './fulfillment.service';
import { FulfillmentController } from './fulfillment.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Fulfillment])],
  controllers: [FulfillmentController],
  providers: [FulfillmentService],
  exports: [FulfillmentService],
})
export class FulfillmentModule {}
