import { Controller, Post, Get, Param, Body, UseGuards, Optional } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators';
import { UserRole } from '../users/user.entity';

@Controller('comments')
export class CommentsController {
  constructor(private service: CommentsService) {}

  @Get(':feedbackId')
  findAll(@Param('feedbackId') feedbackId: string) {
    return this.service.findByFeedback(feedbackId, false);
  }

  @Post(':feedbackId')
  @UseGuards(JwtAuthGuard)
  create(
    @Param('feedbackId') feedbackId: string,
    @Body('body') body: string,
    @Body('is_internal') is_internal: boolean,
    @CurrentUser() user: any,
  ) {
    const canInternal = user.role === UserRole.ADMIN;
    return this.service.create(feedbackId, body, canInternal && is_internal, user);
  }

  @Get(':feedbackId/all')
  @UseGuards(JwtAuthGuard)
  findAllAdmin(@Param('feedbackId') feedbackId: string, @CurrentUser() user: any) {
    return this.service.findByFeedback(feedbackId, user.role === UserRole.ADMIN);
  }
}
