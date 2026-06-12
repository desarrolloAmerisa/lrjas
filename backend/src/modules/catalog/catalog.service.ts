import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CatalogService {
  constructor(private prisma: PrismaService) {}

  async getStakes() {
    return this.prisma.stake.findMany({
      where: { active: true },
      include: {
        wards: { where: { active: true }, orderBy: { name: 'asc' } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getWardsByStake(stakeId: string) {
    return this.prisma.ward.findMany({
      where: { stakeId, active: true },
      orderBy: { name: 'asc' },
    });
  }
}
