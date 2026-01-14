import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class BlockUserDto {
  @IsMongoId()
  blockedUserId: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
