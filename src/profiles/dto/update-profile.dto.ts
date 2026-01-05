import {
  IsString,
  IsOptional,
  IsEnum,
  MaxLength,
  IsArray,
  ArrayUnique,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Gender, Habit, EducationLevel } from '../entities/profile.schema';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  interests?: string[];

  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(250)
  heightCm?: number;

  @IsOptional()
  @IsString()
  religion?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsEnum(Habit, { each: true })
  habits?: Habit[];

  @IsOptional()
  @IsEnum(EducationLevel)
  education?: EducationLevel;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsString()
  locationLatLng?: string; // will be converted to coordinates [lng, lat]

  @IsOptional()
  isVisible?: boolean;
}
