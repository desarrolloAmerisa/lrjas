import { Controller, Get, Param } from '@nestjs/common';
import { CatalogService } from './catalog.service';

@Controller('catalog')
export class CatalogController {
  constructor(private catalogService: CatalogService) {}

  @Get('stakes')
  getStakes() {
    return this.catalogService.getStakes();
  }

  @Get('stakes/:stakeId/wards')
  getWards(@Param('stakeId') stakeId: string) {
    return this.catalogService.getWardsByStake(stakeId);
  }
}
