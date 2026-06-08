import { IsOptional, IsEnum, IsIn } from 'class-validator';
import { PaginationDto } from '../../common/pagination.dto';
import { FeedbackCategory, FeedbackStatus } from '../feedback.entity';

export class QueryFeedbackDto extends PaginationDto {
  @IsOptional()
  @IsEnum(FeedbackStatus)
  status?: FeedbackStatus;

  @IsOptional()
  @IsEnum(FeedbackCategory)
  category?: FeedbackCategory;

  @IsOptional()
  @IsIn(['votes', 'date'])
  sort?: 'votes' | 'date' = 'votes';
}
