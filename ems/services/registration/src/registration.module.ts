import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuditModule } from '../../audit/src/audit.module';
import { OrderItemEntity } from '../../commerce/src/entities/order-item.entity';
import { OrderEntity } from '../../commerce/src/entities/order.entity';
import { EventSettingEntity } from '../../event/src/entities/event-setting.entity';
import { RegistrationQuestionEntity } from '../../event/src/entities/registration-question.entity';
import { TicketEntity } from '../../ticketing/src/entities/ticket.entity';
import { EventBusModule } from '../../shared/src/event-bus';
import { RegistrationEntity } from './entities/registration.entity';
import { RegistrantProfileEntity } from './entities/registrant-profile.entity';
import { RegistrationController } from './registration.controller';
import { RegistrationService } from './registration.service';
import { RegistrationEventsPublisher } from './registration-events.publisher';

@Module({
  imports: [
    AuditModule,
    EventBusModule.forRoot(),
    TypeOrmModule.forFeature([
      RegistrationEntity,
      RegistrantProfileEntity,
      EventSettingEntity,
      TicketEntity,
      OrderEntity,
      OrderItemEntity,
      RegistrationQuestionEntity,
    ]),
  ],
  controllers: [RegistrationController],
  providers: [RegistrationService, RegistrationEventsPublisher],
  exports: [RegistrationService],
})
export class RegistrationModule {}
