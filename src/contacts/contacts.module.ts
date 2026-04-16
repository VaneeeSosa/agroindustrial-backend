import { Module } from '@nestjs/common';
import { ContactsService } from './contacts.service.js';
import { ContactsController } from './contacts.controller.js';
import { LeadsModule } from '../leads/leads.module.js';
import { AnalyticsModule } from '../analytics/analytics.module.js';
import { IntegrationsModule } from '../integrations/integrations.module.js';

@Module({
  imports: [
    LeadsModule,        // 🔥 CLAVE
    AnalyticsModule,
    IntegrationsModule,
  ],
  controllers: [ContactsController],
  providers: [ContactsService],
})
export class ContactsModule {}