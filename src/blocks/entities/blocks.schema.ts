import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BlockDocument = Block & Document;

@Schema({ timestamps: true })
export class Block {
  
  // User who is blocking
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  blocker: Types.ObjectId;

  // User who is being blocked
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  blocked: Types.ObjectId;

  // Optional reason
  @Prop()
  reason?: string;
}

export const BlockSchema = SchemaFactory.createForClass(Block);

// Prevent duplicate block records
BlockSchema.index({ blocker: 1, blocked: 1 }, { unique: true });
