import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';

@Injectable()
export class CommentsService {
  constructor(@InjectRepository(Comment) private repo: Repository<Comment>) {}

  async create(feedbackId: string, body: string, is_internal: boolean, author: any) {
    const comment = this.repo.create({ feedback_id: feedbackId, body, is_internal, author });
    return this.repo.save(comment);
  }

  findByFeedback(feedbackId: string, isAdmin: boolean) {
    const qb = this.repo.createQueryBuilder('c')
      .leftJoinAndSelect('c.author', 'author')
      .where('c.feedback_id = :feedbackId', { feedbackId });
    if (!isAdmin) qb.andWhere('c.is_internal = false');
    return qb.orderBy('c.created_at', 'ASC').getMany();
  }
}
