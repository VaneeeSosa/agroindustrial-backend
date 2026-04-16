import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class GoogleService {
  private readonly logger = new Logger(GoogleService.name);

  async sendConversion(payload: {
    event: string;
    lead: any;
  }) {
    /**
     * Aquí SOLO avisamos a Google
     * (por ahora solo log)
     */

    this.logger.log('Enviando conversión a Google');
    this.logger.log({
      event: payload.event,
      email: payload.lead.email,
      phone: payload.lead.phone,
    });

    // 👇 FUTURO (aquí irá Google Ads / GA4)
    // fetch('https://google...', {...})

    return true;
  }
}