import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Gender, EducationLevel } from '../entities/profile.schema';

export class CreatePreferenceDto {
  @IsNumber()
  @Min(18)
  minAge: number;

  @IsNumber()
  @Max(100)
  maxAge: number;

  @IsArray()
  @IsEnum(Gender, { each: true })
  preferredGender: Gender[];

  @IsNumber()
  maxDistanceKm: number;

  @IsOptional()
  @IsString()
  preferredReligion?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(EducationLevel, { each: true })
  educationLevels?: EducationLevel[];

  @IsBoolean()
  allowSmoking: boolean;

  @IsBoolean()
  allowDrinking: boolean;

  @IsBoolean()
  allowVegan: boolean;

  @IsBoolean()
  allowGym: boolean;

  @IsOptional()
  @IsBoolean()
  showOnlyVisibleProfiles?: boolean;
}
