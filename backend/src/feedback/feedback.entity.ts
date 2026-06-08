import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/base.entity';
import { User } from '../users/user.entity';

export enum FeedbackCategory {
  BUG = 'Bug Report',
  FEATURE = 'Feature Request',
  UX = 'UX Improvement',
  PERFORMANCE = 'Performance',
  DOCS = 'Documentation',
  INTEGRATION = 'Integration',
}

export enum FeedbackStatus {
  OPEN = 'OPEN',
  IN_REVIEW = 'IN_REVIEW',
  PLANNED = 'PLANNED',
  RESOLVED = 'RESOLVED',
  DECLINED = 'DECLINED',
}

@Entity('feedback')
export class Feedback extends BaseEntity {
  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ type: 'enum', enum: FeedbackCategory })
  category: FeedbackCategory;

  @Column({ type: 'enum', enum: FeedbackStatus, default: FeedbackStatus.OPEN })
  status: FeedbackStatus;

  @Column({ default: 1 })
  rating: number;

  @Column({ default: 0 })
  vote_count: number;

  @ManyToOne(() => User, { eager: true, nullable: false })
  @JoinColumn({ name: 'author_id' })
  author: User;

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'assignee_id' })
  assignee: User | null;

  @Column({ type: 'varchar', nullable: true, name: 'merged_into_id' })
  merged_into_id: string | null;
}
