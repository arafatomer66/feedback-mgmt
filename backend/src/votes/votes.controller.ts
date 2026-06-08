import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { VotesService } from './votes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators';

@Controller('votes')
@UseGuards(JwtAuthGuard)
export class VotesController {
  constructor(private service: VotesService) {}

  @Post(':feedbackId')
  toggle(@Param('feedbackId') feedbackId: string, @CurrentUser() user: any) {
    return this.service.toggle(feedbackId, user.id);
  }
}
