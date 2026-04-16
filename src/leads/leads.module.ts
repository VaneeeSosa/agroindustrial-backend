import { Module } from '@nestjs/common';
import { LeadsService } from './leads.service.js';
import { LeadsController } from './leads.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { IntegrationsModule } from '../integrations/integrations.module.js';

@Module({
  imports: [
    PrismaModule,
    IntegrationsModule,
  ],
  controllers: [LeadsController],
  providers: [LeadsService],
  exports: [
    LeadsService,
  ],
})
export class LeadsModule {}