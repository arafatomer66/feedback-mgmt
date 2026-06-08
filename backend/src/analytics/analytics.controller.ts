import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators';
import { UserRole } from '../users/user.entity';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AnalyticsController {
  constructor(private service: AnalyticsService) {}

  @Get('overview')
  overview() {
    return this.service.overview();
  }

  @Get('volume')
  volume(@Query('days') days?: string) {
    return this.service.volume(days ? parseInt(days) : 30);
  }

  @Get('breakdown')
  breakdown() {
    return this.service.breakdown();
  }

  @Get('top-voted')
  topVoted(@Query('limit') limit?: string) {
    return this.service.topVoted(limit ? parseInt(limit) : 10);
  }
}
