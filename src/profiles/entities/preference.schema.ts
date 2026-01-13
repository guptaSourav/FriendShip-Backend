import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Gender, EducationLevel } from './profile.schema';

export type PreferenceDocument = Preference & Document;

@Schema({
  timestamps: true,
})
export class Preference {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  // Age Range
  @Prop({ default: 18, min: 18 })
  minAge: number;

  @Prop({ default: 60, max: 100 })
  maxAge: number;

  // Gender Preference (multiple allowed)
  @Prop({ type: [String], enum: Gender, default: [] })
  preferredGender: Gender[];

  // Distance Preference
  @Prop({ default: 50 }) // in KM
  maxDistanceKm: number;

  // Optional custom search center
//   @Prop({
//     type: {
//       type: String,
//       enum: ['Point'],
//     },
//     coordinates: {
//       type: [Number],
//     },
//   })
//   location?: {
//     type: 'Point';
//     coordinates: [number, number];
//   };

  // Optional filters
  @Prop()
  preferredReligion?: string;

  @Prop({ type: [String], enum: EducationLevel, default: [] })
  educationLevels?: EducationLevel[];

  // Habit preferences
  @Prop({ default: false })
  allowSmoking: boolean;

  @Prop({ default: false })
  allowDrinking: boolean;

  @Prop({ default: false })
  allowVegan: boolean;

  @Prop({ default: false })
  allowGym: boolean;

  // Visibility filter
  @Prop({ default: true })
  showOnlyVisibleProfiles: boolean;
}

export const PreferenceSchema = SchemaFactory.createForClass(Preference);

// Geo index for distance queries
PreferenceSchema.index({ location: '2dsphere' });
