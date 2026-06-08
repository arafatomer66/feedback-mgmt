import { IsString, IsEnum, IsInt, Min, Max, MinLength } from 'class-validator';
import { FeedbackCategory } from '../feedback.entity';

export class CreateFeedbackDto {
  @IsString()
  @MinLength(5)
  title: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsEnum(FeedbackCategory)
  category: FeedbackCategory;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;
}
