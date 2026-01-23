import { IsString } from 'class-validator';

export class PresignSingleDto {
  @IsString()
  contentType: string;

  @IsString()
  extension: string;
}
