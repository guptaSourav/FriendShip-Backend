import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum AuthProvider {
  GOOGLE = 'google',
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, enum: AuthProvider })
  provider: AuthProvider;

  @Prop({ required: true })
  providerId: string; // Google sub ID

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ default: false })
  isProfileCompleted: boolean;

  @Prop({ default: false })
  isBlocked: boolean;

  @Prop({ type: [String], default: [] })
  fcmTokens: string[];
  
  @Prop()
  lastLoginAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// 🔐 Indexes
UserSchema.index({ provider: 1, providerId: 1 }, { unique: true });
