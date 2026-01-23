import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class FileMetaDto {
  contentType: string;
  extension: string;
}

export class PresignMultipleDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileMetaDto)
  files: FileMetaDto[];
}
