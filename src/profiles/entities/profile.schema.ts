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

// export enum Habit {
//   SMOKING = 'smoking',
//   DRINKING = 'drinking',
//   GYM = 'gym',
//   VEGAN = 'vegan',
// }

export enum EducationLevel {
  HIGH_SCHOOL = 'high_school',
  BACHELORS = 'bachelors',
  MASTERS = 'masters',
  PHD = 'phd',
}

export enum DocumentType {
  ID_CARD = 'id_card',
  PASSPORT = 'passport',
  DRIVER_LICENSE = 'driver_license',
  ADHAAR = 'aadhaar',
}

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Profile {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ maxlength: 500 })
  bio?: string;

  @Prop({ required: true })
  dateOfBirth: Date;

  @Prop({ enum: Gender, required: true })
  gender: Gender;

  @Prop({ min: 100, max: 250 })
  heightCm?: number;

  @Prop()
  religion?: string;

  @Prop({ type: [String], default: [] })
  habits: string[];

  @Prop({ enum: EducationLevel })
  education?: EducationLevel;

  @Prop({ type: [String], default: [] })
  interests: string[];

  @Prop({ type: [String], default: [] })
  photos: string[];

  @Prop({ type: String, default: null })
  primaryPhoto: string | null;

  @Prop({
    type: {
      type: String,
      enum: ['Point'],
      required: false,
    },
    coordinates: {
      type: [Number],
      required: false,
    },
  })
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };

  @Prop({ default: null })
  city: string;

  @Prop({ default: null })
  state: string;

  @Prop({ default: null })
  country: string;

  @Prop({ default: false })
  drinking: boolean;

  @Prop({ default: false })
  smoking: boolean;

  @Prop({ default: false })
  vegan: boolean;

  @Prop({ default: false })
  gym: boolean;

  @Prop({ default: true })
  isVisible: boolean;

  @Prop({ default: 0, min: 0, max: 100 })
  completionPercentage: number;

  @Prop({ enum: ProfileStatus, default: ProfileStatus.DRAFT })
  status: ProfileStatus;

  @Prop({ default: 0 })
  likeCount: number;

  @Prop({ default: null })
  documentUrl: string;

  @Prop({ enum: DocumentType, default: null })
  documentType: DocumentType;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);

ProfileSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) return null;

  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  // console.log('dob', birthDate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
});

// 📍 Geo index for nearby search
ProfileSchema.index({ location: '2dsphere' });
