import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback, FeedbackStatus } from './feedback.entity';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { QueryFeedbackDto } from './dto/query-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(@InjectRepository(Feedback) private repo: Repository<Feedback>) {}

  async findAll(query: QueryFeedbackDto, userId?: string) {
    const { page = 1, limit = 20, status, category, sort = 'votes' } = query;
    const qb = this.repo.createQueryBuilder('f')
      .leftJoinAndSelect('f.author', 'author')
      .leftJoinAndSelect('f.assignee', 'assignee')
      .where('f.merged_into_id IS NULL');

    if (status) qb.andWhere('f.status = :status', { status });
    if (category) qb.andWhere('f.category = :category', { category });

    if (sort === 'votes') qb.orderBy('f.vote_count', 'DESC').addOrderBy('f.created_at', 'DESC');
    else qb.orderBy('f.created_at', 'DESC');

    const [items, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const item = await this.repo.findOne({ where: { id }, relations: { author: true, assignee: true } });
    if (!item) throw new NotFoundException('Feedback not found');
    return item;
  }

  async create(dto: CreateFeedbackDto, author: any) {
    const feedback = this.repo.create({ ...dto, author, vote_count: 0 });
    return this.repo.save(feedback);
  }

  async updateStatus(id: string, status: FeedbackStatus) {
    const item = await this.findOne(id);
    item.status = status;
    return this.repo.save(item);
  }

  async assign(id: string, assignee: any) {
    const item = await this.findOne(id);
    item.assignee = assignee;
    return this.repo.save(item);
  }

  async merge(sourceId: string, targetId: string) {
    await this.findOne(targetId);
    const source = await this.findOne(sourceId);
    source.merged_into_id = targetId;
    source.status = FeedbackStatus.RESOLVED;
    return this.repo.save(source);
  }

  incrementVote(id: string, delta: 1 | -1) {
    return this.repo.increment({ id }, 'vote_count', delta);
  }
}
