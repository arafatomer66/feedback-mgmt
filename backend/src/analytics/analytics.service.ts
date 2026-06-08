import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Feedback, FeedbackStatus } from '../feedback/feedback.entity';
import { Comment } from '../comments/comment.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Feedback) private feedbackRepo: Repository<Feedback>,
    @InjectRepository(Comment) private commentRepo: Repository<Comment>,
  ) {}

  async overview() {
    const total = await this.feedbackRepo.count();
    const open = await this.feedbackRepo.count({ where: { status: FeedbackStatus.OPEN } });
    const resolved = await this.feedbackRepo.count({ where: { status: FeedbackStatus.RESOLVED } });
    const inReview = await this.feedbackRepo.count({ where: { status: FeedbackStatus.IN_REVIEW } });
    const planned = await this.feedbackRepo.count({ where: { status: FeedbackStatus.PLANNED } });
    const declined = await this.feedbackRepo.count({ where: { status: FeedbackStatus.DECLINED } });

    const avgResolution = await this.feedbackRepo
      .createQueryBuilder('f')
      .select("AVG(EXTRACT(EPOCH FROM (f.updated_at - f.created_at))/86400)", 'avg_days')
      .where('f.status = :status', { status: FeedbackStatus.RESOLVED })
      .getRawOne();

    return {
      total, open, resolved, inReview, planned, declined,
      avg_resolution_days: parseFloat(avgResolution?.avg_days || '0').toFixed(1),
      resolution_rate: total > 0 ? ((resolved / total) * 100).toFixed(1) : '0',
    };
  }

  async volume(days = 30) {
    const result = await this.feedbackRepo
      .createQueryBuilder('f')
      .select("DATE(f.created_at)", 'date')
      .addSelect("COUNT(*)", 'count')
      .where("f.created_at >= NOW() - INTERVAL ':days days'", { days })
      .groupBy("DATE(f.created_at)")
      .orderBy("DATE(f.created_at)", 'ASC')
      .getRawMany();
    return result;
  }

  async breakdown() {
    const byStatus = await this.feedbackRepo
      .createQueryBuilder('f')
      .select('f.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('f.status')
      .getRawMany();

    const byCategory = await this.feedbackRepo
      .createQueryBuilder('f')
      .select('f.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .groupBy('f.category')
      .getRawMany();

    return { byStatus, byCategory };
  }

  async topVoted(limit = 10) {
    return this.feedbackRepo.find({
      where: { merged_into_id: IsNull() },
      order: { vote_count: 'DESC', created_at: 'DESC' },
      take: limit,
      relations: { author: true },
    });
  }
}
