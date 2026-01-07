import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

export enum NotificationType {
  LIKE = 'like',
  MATCH = 'match',
  PLATFORM = 'platform',
}

export enum NotificationPlatform {
  IN_APP = 'in_app',
  EMAIL = 'email',
  BOTH = 'both',
}

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  receiver: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  sender?: Types.ObjectId;

  @Prop({ required: true, enum: NotificationType })
  type: NotificationType;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  body: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ enum: NotificationPlatform, default: NotificationPlatform.IN_APP })
  platform: NotificationPlatform;

  // matchId / profileId etc.
  @Prop({ type: Types.ObjectId })
  entityId?: Types.ObjectId;

  @Prop({ type: Object })
  meta?: Record<string, any>;
}
export const NotificationSchema = SchemaFactory.createForClass(Notification);
