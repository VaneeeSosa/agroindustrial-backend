import { Module } from '@nestjs/common';
import { IntegrationsService } from './integrations.service.js';
import { BrevoService } from './brevo/brevo.service.js';

@Module({
  providers: [
    IntegrationsService,
    BrevoService,
  ],
  exports: [
    IntegrationsService, // 👈 CLAVE
  ],
})
export class IntegrationsModule {}