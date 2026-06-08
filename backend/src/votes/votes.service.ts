import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vote } from './vote.entity';
import { FeedbackService } from '../feedback/feedback.service';

@Injectable()
export class VotesService {
  constructor(
    @InjectRepository(Vote) private repo: Repository<Vote>,
    private feedbackService: FeedbackService,
  ) {}

  async toggle(feedbackId: string, userId: string) {
    const existing = await this.repo.findOne({ where: { feedback_id: feedbackId, user_id: userId } });

    if (existing) {
      await this.repo.remove(existing);
      await this.feedbackService.incrementVote(feedbackId, -1);
      return { voted: false };
    }

    await this.repo.save(this.repo.create({ feedback_id: feedbackId, user_id: userId }));
    await this.feedbackService.incrementVote(feedbackId, 1);
    return { voted: true };
  }

  async getVotedIds(userId: string, feedbackIds: string[]) {
    if (!feedbackIds.length) return [];
    const votes = await this.repo.createQueryBuilder('v')
      .where('v.user_id = :userId', { userId })
      .andWhere('v.feedback_id IN (:...ids)', { ids: feedbackIds })
      .getMany();
    return votes.map(v => v.feedback_id);
  }
}
