import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalParticipants,
      totalAttendances,
      newThisMonth,
      activeParticipants,
      sexDistribution,
      stakeDistribution,
      monthlyAttendances,
      monthlyRegistrations,
      fieldDistributions,
    ] = await Promise.all([
      this.prisma.participant.count({ where: { active: true } }),
      this.prisma.attendance.count(),
      this.prisma.participant.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      this.prisma.participant.count({
        where: {
          active: true,
          attendances: { some: { createdAt: { gte: thirtyDaysAgo } } },
        },
      }),
      this.prisma.participant.groupBy({
        by: ['sex'],
        _count: { id: true },
        where: { active: true },
      }),
      this.prisma.participant.groupBy({
        by: ['stakeId'],
        _count: { id: true },
        where: { active: true },
      }),
      this.getMonthlyAttendances(),
      this.getMonthlyRegistrations(),
      this.getFieldDistributions(),
    ]);

    const stakes = await this.prisma.stake.findMany();
    const stakeMap = Object.fromEntries(stakes.map((s) => [s.id, s.name]));

    return {
      kpis: {
        totalParticipants,
        totalAttendances,
        newThisMonth,
        activeParticipants,
      },
      charts: {
        monthlyAttendances,
        monthlyRegistrations,
        sexDistribution: sexDistribution.map((s) => ({
          sex: s.sex === 'MALE' ? 'Masculino' : 'Femenino',
          count: s._count.id,
        })),
        stakeDistribution: stakeDistribution.map((s) => ({
          stake: stakeMap[s.stakeId] || 'Desconocida',
          count: s._count.id,
        })),
        fieldDistributions,
      },
    };
  }

  private async getFieldDistributions() {
    const fields = await this.prisma.fieldDefinition.findMany({
      where: { active: true },
      orderBy: { createdAt: 'asc' },
    });

    if (fields.length === 0) return [];

    const counts = await this.prisma.participantFieldValue.groupBy({
      by: ['fieldId', 'value'],
      _count: { id: true },
      where: {
        fieldId: { in: fields.map((f) => f.id) },
        participant: { active: true },
      },
    });

    const countMap = new Map<string, { yes: number; no: number }>();
    for (const field of fields) {
      countMap.set(field.id, { yes: 0, no: 0 });
    }
    for (const entry of counts) {
      const bucket = countMap.get(entry.fieldId);
      if (!bucket) continue;
      if (entry.value) bucket.yes = entry._count.id;
      else bucket.no = entry._count.id;
    }

    return fields.map((field) => {
      const bucket = countMap.get(field.id) ?? { yes: 0, no: 0 };
      return {
        fieldName: field.name,
        label: field.label,
        data: [
          { label: 'Sí', count: bucket.yes },
          { label: 'No', count: bucket.no },
        ],
      };
    });
  }

  private async getMonthlyAttendances() {
    const months: { month: string; count: number }[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const count = await this.prisma.attendance.count({
        where: { createdAt: { gte: start, lt: end } },
      });
      months.push({
        month: start.toLocaleDateString('es-MX', { month: 'short' }),
        count,
      });
    }

    return months;
  }

  private async getMonthlyRegistrations() {
    const months: { month: string; count: number }[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const count = await this.prisma.participant.count({
        where: { createdAt: { gte: start, lt: end } },
      });
      months.push({
        month: start.toLocaleDateString('es-MX', { month: 'short' }),
        count,
      });
    }

    return months;
  }
}
