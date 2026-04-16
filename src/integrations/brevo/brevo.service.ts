import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class BrevoService {
  private readonly logger = new Logger(BrevoService.name);

  private readonly API_URL = 'https://api.brevo.com/v3';
  private readonly API_KEY = process.env.BREVO_API_KEY;
  private readonly TEMPLATE_ID = Number(process.env.BREVO_TEMPLATE_ID);

  async sendLeadEmail(payload: {
    event: string;
    lead: any;
  }) {
    const { lead } = payload;

    try {
      // 1️⃣ Crear / actualizar contacto
      await axios.post(
        `${this.API_URL}/contacts`,
        {
          email: lead.email,
          attributes: {
            FIRSTNAME: lead.name || '',
            PHONE: lead.phone || '',
          },
          updateEnabled: true,
        },
        {
          headers: {
            'api-key': this.API_KEY,
            'content-type': 'application/json',
            accept: 'application/json',
          },
        },
      );

      this.logger.log(`✅ Contacto sincronizado: ${lead.email}`);

      // 2️⃣ Enviar email transaccional
      await axios.post(
        `${this.API_URL}/smtp/email`,
        {
          to: [{ email: lead.email }],
          templateId: this.TEMPLATE_ID,
          params: {
            name: lead.name || 'Cliente',
            phone: lead.phone || '',
          },
        },
        {
          headers: {
            'api-key': this.API_KEY,
            'content-type': 'application/json',
            accept: 'application/json',
          },
        },
      );

      this.logger.log(`📧 Email enviado a ${lead.email}`);
      return true;

    } catch (error: any) {
      this.logger.error(
        '❌ Error enviando email a Brevo',
        error.response?.data || error.message,
      );
      throw new InternalServerErrorException('Error enviando correo');
    }
  }
}