import { IsEnum, IsMongoId } from 'class-validator';
import { SwipeAction } from '../entities/swipe.schema';

export class SwipeDto {
  @IsMongoId()
  toUserId: string;

  @IsEnum(SwipeAction)
  action: SwipeAction;
}
