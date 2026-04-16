import { Injectable } from '@nestjs/common';
import { BrevoService } from './brevo/brevo.service.js';

@Injectable()
export class IntegrationsService {

  constructor(
    private readonly brevoService: BrevoService,
  ) {}

  async dispatch(payload: {
    lead: any;
    event: string;
  }) {
    if (payload.event === 'contact_submit') {
      await this.brevoService.sendLeadEmail(payload);
    }

    return true;
  }
}