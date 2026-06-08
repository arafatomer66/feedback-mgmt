import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Optional } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { QueryFeedbackDto } from './dto/query-feedback.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles, CurrentUser } from '../auth/decorators';
import { UserRole } from '../users/user.entity';
import { FeedbackStatus } from './feedback.entity';
import { UsersService } from '../users/users.service';

@Controller('feedback')
export class FeedbackController {
  constructor(private service: FeedbackService, private users: UsersService) {}

  @Get()
  findAll(@Query() query: QueryFeedbackDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateFeedbackDto, @CurrentUser() user: any) {
    return this.service.create(dto, user);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateStatus(@Param('id') id: string, @Body('status') status: FeedbackStatus) {
    return this.service.updateStatus(id, status);
  }

  @Patch(':id/assign')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async assign(@Param('id') id: string, @Body('assignee_id') assigneeId: string) {
    const assignee = await this.users.findById(assigneeId);
    return this.service.assign(id, assignee);
  }

  @Post(':id/merge')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  merge(@Param('id') id: string, @Body('target_id') targetId: string) {
    return this.service.merge(id, targetId);
  }
}
