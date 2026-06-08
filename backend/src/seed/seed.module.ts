import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Feedback } from '../feedback/feedback.entity';
import { Vote } from '../votes/vote.entity';
import { Comment } from '../comments/comment.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Feedback, Vote, Comment])],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
