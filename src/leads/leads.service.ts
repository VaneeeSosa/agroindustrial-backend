import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateLeadDto } from '../dto/create-lead.dto.js';
import { IntegrationsService } from '../integrations/integrations.service.js';

@Injectable()
export class LeadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly integrations: IntegrationsService,
  ) {}

  /**
   * UPSERT de lead (por email o teléfono)
   * 👉 Útil para formularios multipaso o reintentos
   */
  async upsert(dto: any) {
    const existing = await this.prisma.lead.findFirst({
      where: {
        OR: [{ email: dto.email }, { phone: dto.phone }],
      },
    });

    let lead;

    if (existing) {
      lead = await this.prisma.lead.update({
        where: { id: existing.id },
        data: {
          name: dto.name ?? existing.name,
          email: dto.email ?? existing.email,
          phone: dto.phone ?? existing.phone,
          source: dto.source ?? existing.source,
          utm_source: dto.utm_source ?? existing.utm_source,
          utm_medium: dto.utm_medium ?? existing.utm_medium,
          utm_campaign: dto.utm_campaign ?? existing.utm_campaign,
          utm_term: dto.utm_term ?? existing.utm_term,
          utm_content: dto.utm_content ?? existing.utm_content,
          meta: dto.meta ?? existing.meta,
        },
      });
    } else {
      lead = await this.prisma.lead.create({
        data: {
          name: dto.name,
          email: dto.email,
          phone: dto.phone,
          source: dto.source,
          utm_source: dto.utm_source,
          utm_medium: dto.utm_medium,
          utm_campaign: dto.utm_campaign,
          utm_term: dto.utm_term,
          utm_content: dto.utm_content,
          meta: dto.meta ?? undefined,
        },
      });
    }

    // 🔥 DISPARO DE INTEGRACIONES (EMAIL, GOOGLE, ETC.)
    await this.integrations.dispatch({
      event: 'contact_submit',
      lead,
    });

    return lead;
  }

  /**
   * CREATE simple (lead nuevo)
   */
  async create(dto: CreateLeadDto) {
    let lead;
  console.log('🚀 POST /lead recibido', dto);

    // Si existe por email, actualiza
    if (dto.email) {
      const existing = await this.prisma.lead.findUnique({
        where: { email: dto.email },
      });

      if (existing) {
        lead = await this.prisma.lead.update({
          where: { id: existing.id },
          data: {
            ...dto,
            meta: dto.meta ?? existing.meta,
          },
        });
      }
    }

    // Si no existía, lo creamos
    if (!lead) {
      lead = await this.prisma.lead.create({
        data: {
          name: dto.name,
          email: dto.email,
          phone: dto.phone,
          source: dto.source,
          meta: dto.meta ?? undefined,
          utm_source: dto.utm_source,
          utm_medium: dto.utm_medium,
          utm_campaign: dto.utm_campaign,
          utm_term: dto.utm_term,
          utm_content: dto.utm_content,
        },
      });
    }

    // 🔥 DISPARO DE INTEGRACIONES (AQUÍ ESTABA EL ERROR)
    await this.integrations.dispatch({
      event: 'contact_submit',
      lead,
    });

    return lead;
  }

  async findById(id: number) {
    return this.prisma.lead.findUnique({ where: { id } });
  }
}