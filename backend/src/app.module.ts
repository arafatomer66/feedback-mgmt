import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FeedbackModule } from './feedback/feedback.module';
import { VotesModule } from './votes/votes.module';
import { CommentsModule } from './comments/comments.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { SeedModule } from './seed/seed.module';
import { User } from './users/user.entity';
import { Feedback } from './feedback/feedback.entity';
import { Vote } from './votes/vote.entity';
import { Comment } from './comments/comment.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get('DATABASE_URL'),
        entities: [User, Feedback, Vote, Comment],
        synchronize: true,
        ssl: config.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    FeedbackModule,
    VotesModule,
    CommentsModule,
    AnalyticsModule,
    SeedModule,
  ],
  providers: [
    { provide: APP_PIPE, useValue: new ValidationPipe({ transform: true, whitelist: true }) },
  ],
})
export class AppModule {}
