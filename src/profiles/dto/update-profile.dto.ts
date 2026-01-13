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
import { Gender, EducationLevel } from '../entities/profile.schema';

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
  habits?: string[];

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

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  drinking?: boolean;

  @IsOptional()
  smoking?: boolean;

  @IsOptional()
  gym?: boolean;

  @IsOptional()
  vegan?: boolean;
}
