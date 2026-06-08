import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/base.entity';
import { User } from '../users/user.entity';
import { Feedback } from '../feedback/feedback.entity';

@Entity('comments')
export class Comment extends BaseEntity {
  @Column('text')
  body: string;

  @Column({ default: false })
  is_internal: boolean;

  @ManyToOne(() => Feedback, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'feedback_id' })
  feedback: Feedback;

  @Column({ name: 'feedback_id' })
  feedback_id: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'author_id' })
  author: User;
}
