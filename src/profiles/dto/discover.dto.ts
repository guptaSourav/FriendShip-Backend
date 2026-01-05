import { IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from '../../profiles/entities/profile.schema';

export class DiscoverDto {
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  distanceKm?: number = 50;

  @IsOptional()
  @Type(() => Number)
  minAge?: number;

  @IsOptional()
  @Type(() => Number)
  maxAge?: number;

  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;
}
