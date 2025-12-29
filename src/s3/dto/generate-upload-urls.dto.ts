import { IsString, IsArray, ArrayMaxSize, ValidateNested, IsMimeType } from 'class-validator';
import { Type } from 'class-transformer';

class FileDto {
  @IsString()
  contentType: string;

  @IsString()
  extension: string;
}

export class GenerateMultipleUploadUrlsDto {
  @IsString()
  userId: string;

  @IsArray()
  @ArrayMaxSize(6) // Tinder-style max 6 photos
  @ValidateNested({ each: true })
  @Type(() => FileDto)
  files: FileDto[];
}
