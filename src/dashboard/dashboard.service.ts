import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { DashboardQueryDto } from './dto/dashboard-query.dto.js';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getOverview(query: DashboardQueryDto) {
    const {
      startDate,
      endDate,
      source,
      utm_campaign,
      status,
      page = 1,
      limit = 20,
    } = query;

    const where: any = {
      ...(source && { source }),
      ...(utm_campaign && { utm_campaign }),
      ...(status && { status }),
      ...(startDate || endDate
        ? {
            createdAt: {
              ...(startDate && { gte: new Date(startDate) }),
              ...(endDate && { lte: new Date(endDate) }),
            },
          }
        : {}),
    };

    const skip = (page - 1) * limit;

    const [
      totalLeads,
      leadsToday,
      leadsThisMonth,
      leadsOverTime,
      channels,
      funnel,
      leads,
    ] = await Promise.all([

      // KPI: total leads
      this.prisma.lead.count({ where }),

      // KPI: leads today
      this.prisma.lead.count({
        where: {
          ...where,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),

      // KPI: leads this month
      this.prisma.lead.count({
        where: {
          ...where,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),

      // Chart: leads over time
      this.prisma.$queryRaw`
        SELECT DATE("createdAt") as date, COUNT(*)::int as count
        FROM "Lead"
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      `,

      // Chart: channels
      this.prisma.lead.groupBy({
        by: ['utm_source'],
        _count: { utm_source: true },
      }),

      // Funnel
      this.prisma.event.groupBy({
        by: ['type'],
        _count: { type: true },
      }),

      // Leads table
      this.prisma.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          source: true,
          utm_campaign: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      kpis: {
        totalLeads,
        leadsToday,
        leadsThisMonth,
        conversionRate: totalLeads
          ? Number(((leads.length / totalLeads) * 100).toFixed(2))
          : 0,
      },

      charts: {
        leadsOverTime,
        channels: channels.map(c => ({
          source: c.utm_source,
          count: c._count.utm_source,
        })),
        funnel: funnel.reduce((acc, f) => {
          acc[f.type] = f._count.type;
          return acc;
        }, {}),
      },

      leads: {
        data: leads,
        pagination: {
          page,
          limit,
          total: totalLeads,
        },
      },
    };
  }
}