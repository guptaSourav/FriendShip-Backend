import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SwipeDocument = Swipe & Document;

export enum SwipeAction {
  LIKE = 'like',
  DISLIKE = 'dislike',
}

@Schema({ timestamps: true })
export class Swipe {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  fromUser: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  toUser: Types.ObjectId;

  @Prop({ enum: SwipeAction, required: true })
  action: SwipeAction;
}

export const SwipeSchema = SchemaFactory.createForClass(Swipe);

/**
 * 🔒 Critical index
 * A user can swipe another user ONLY ONCE
 */
SwipeSchema.index(
  { fromUser: 1, toUser: 1 },
  { unique: true },
);
