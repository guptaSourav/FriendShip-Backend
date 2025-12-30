// src/profiles/entities/profile.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProfileDocument = Profile & Document;

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum ProfileStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
}

@Schema({ timestamps: true })
export class Profile {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  bio?: string;

  @Prop({ required: true })
  dateOfBirth: Date;

  @Prop({ enum: Gender, required: true })
  gender: Gender;

  @Prop({ type: [String], default: [] })
  interests: string[];

  @Prop({ type: [String], default: [] })
  photos: string[]; // all uploaded S3 URLs

  @Prop({ default: null })
  primaryPhoto: string; // must exist in photos[]

  @Prop({
    type: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number] }, // [lng, lat]
    },
  })
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };

  @Prop({ default: true })
  isVisible: boolean;

  @Prop({ default: 0 })
  completionPercentage: number;

  @Prop({ enum: ProfileStatus, default: ProfileStatus.DRAFT })
  status: ProfileStatus;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);

// 📍 Geo index for nearby search
ProfileSchema.index({ location: '2dsphere' });
