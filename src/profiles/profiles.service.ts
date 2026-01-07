// src/profiles/profiles.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Profile, ProfileDocument } from './entities/profile.schema';
import { ProfileStatus } from './entities/profile.schema';
import { Gender } from './entities/profile.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { NotFoundException } from '@nestjs/common';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Habit } from './entities/profile.schema';
import { EducationLevel } from './entities/profile.schema';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectModel(Profile.name)
    private profileModel: Model<ProfileDocument>,
  ) {}

  async createProfile(data: {
    userId: Types.ObjectId | string;
    name: string;
    dateOfBirth: Date;
    gender: Gender;
  }): Promise<ProfileDocument> {
    const profile = new this.profileModel({
      userId: data.userId,
      name: data.name,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      status: ProfileStatus.DRAFT, // default
      completionPercentage: 0, // default
    });

    return profile.save();
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<ProfileDocument> {
    const profile = await this.profileModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    if (!profile) throw new Error('Profile not found');

    // Update fields dynamically
    if (dto.bio !== undefined) profile.bio = dto.bio;
    if (dto.interests !== undefined) profile.interests = dto.interests;
    if (dto.heightCm !== undefined) profile.heightCm = dto.heightCm;
    if (dto.religion !== undefined) profile.religion = dto.religion;
    if (dto.habits !== undefined) profile.habits = dto.habits;
    if (dto.education !== undefined) profile.education = dto.education;
    if (dto.gender !== undefined) profile.gender = dto.gender;
    if (dto.isVisible !== undefined) profile.isVisible = dto.isVisible;

    // Handle location if provided as "lat,lng"
    if (dto.locationLatLng) {
      const [lat, lng] = dto.locationLatLng.split(',').map(Number);
      if (!isNaN(lat) && !isNaN(lng)) {
        profile.location = { type: 'Point', coordinates: [lng, lat] };
      }
    }

    profile.completionPercentage = this.calculateCompletion(profile);

    if (profile.completionPercentage >= 70) {
      profile.status = ProfileStatus.ACTIVE;
    }

    return profile.save();
  }

  async updateLocation(
    userId: string,
    dto: UpdateLocationDto,
  ): Promise<ProfileDocument> {
    const profile = await this.profileModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    if (!profile) {
      throw new Error('Profile not found');
    }

    profile.location = {
      type: 'Point',
      coordinates: [dto.lng, dto.lat], // ⚠️ lng first (MongoDB rule)
    };

    // Recalculate completion
    profile.completionPercentage = this.calculateCompletion(profile);

    // Activate if eligible
    if (profile.completionPercentage >= 70) {
      profile.status = ProfileStatus.ACTIVE;
    }

    return profile.save();
  }

  async getMyProfile(userId: string): Promise<ProfileDocument> {
    const profile = await this.profileModel.findOne({
      userId: new Types.ObjectId(userId),
    });
    // .select('-dateOfBirth');

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async getProfileByUserId(userId: string) {
    return this.profileModel
      .findOne({
        userId: new Types.ObjectId(userId),
        isVisible: true,
        status: ProfileStatus.ACTIVE,
      })
      .select(
        `
      name
      bio
      gender
      age
      interests
      heightCm
      religion
      habits
      education
      location
      `,
      )
      .lean();
  }

  // Helper method to calculate completion
  private calculateCompletion(profile: ProfileDocument): number {
    let completed = 0;
    const checks = [
      !!profile.bio,
      profile.interests?.length > 0,
      !!profile.heightCm,
      !!profile.religion,
      profile.habits?.length > 0,
      !!profile.education,
      !!profile.gender,
      profile.location?.coordinates?.length === 2,
      profile.photos?.length > 0,
    ];

    const weight = 100 / checks.length;

    checks.forEach((c) => {
      if (c) completed += weight;
    });

    return Math.min(100, Math.round(completed));
  }
}
