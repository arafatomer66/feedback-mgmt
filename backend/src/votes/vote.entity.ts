import { Entity, ManyToOne, JoinColumn, CreateDateColumn, PrimaryGeneratedColumn, Unique, Column } from 'typeorm';
import { User } from '../users/user.entity';
import { Feedback } from '../feedback/feedback.entity';

@Entity('votes')
@Unique(['user_id', 'feedback_id'])
export class Vote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  user_id: string;

  @Column({ name: 'feedback_id' })
  feedback_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Feedback)
  @JoinColumn({ name: 'feedback_id' })
  feedback: Feedback;

  @CreateDateColumn()
  created_at: Date;
}
