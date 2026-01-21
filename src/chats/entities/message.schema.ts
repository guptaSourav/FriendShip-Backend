import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum MessageStatus {
  SENT = 'sent',
  SEEN = 'seen',
}

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
  @Prop({ type: Types.ObjectId, ref: 'ChatRoom', required: true })
  chatRoomId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  senderId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  receiverId: Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ enum: MessageStatus, default: MessageStatus.SENT })
  status: MessageStatus;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
