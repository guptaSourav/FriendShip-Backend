import { IsNotEmpty, IsOptional, IsEnum, IsMongoId, IsObject, IsString } from 'class-validator';
import { NotificationType } from '../entities/notification.schema';

export class CreateNotificationDto {
  @IsNotEmpty()
  @IsMongoId()
  receiver: string; // Use string in DTO; convert to ObjectId in service

  @IsOptional()
  @IsMongoId()
  sender?: string;

  @IsNotEmpty()
  @IsEnum(NotificationType)
  type: NotificationType;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  body: string;

  @IsOptional()
  @IsObject()
  meta?: Record<string, any>;

  @IsOptional()
  @IsMongoId()
  entityId?: string;

  @IsOptional()
  @IsEnum(['in_app', 'push', 'both'])
  platform?: 'in_app' | 'push' | 'both';
}
