import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChatRoomDocument = ChatRoom & Document;

@Schema({ timestamps: true })
export class ChatRoom {
  @Prop({ type: [Types.ObjectId], ref: 'User', required: true })
  participants: Types.ObjectId[];
  
  @Prop({ default: '' })
  lastMessage: string;

  @Prop()
  lastMessageAt: Date;
}

export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom);
