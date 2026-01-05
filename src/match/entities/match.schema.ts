import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Add this to make TS aware of timestamps
export type MatchDocument = Match & Document & { createdAt: Date; updatedAt: Date };

@Schema({ timestamps: true })
export class Match {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user1: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user2: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;
}

export const MatchSchema = SchemaFactory.createForClass(Match);

/**
 * 🔒 Ensure only ONE match per pair (order-independent)
 */
MatchSchema.index(
  { user1: 1, user2: 1 },
  { unique: true },
);
