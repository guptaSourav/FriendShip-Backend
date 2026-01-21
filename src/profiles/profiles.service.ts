// src/profiles/profiles.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Profile, ProfileDocument } from './entities/profile.schema';
import { ProfileStatus } from './entities/profile.schema';
import { Gender } from './entities/profile.schema';
import { Preference } from './entities/preference.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { NotFoundException } from '@nestjs/common';
import { UpdateLocationDto } from './dto/update-location.dto';
import { getLocationFromCoordinates } from '../common/utils/location.helper';
import { ProfileWithPreference } from './dto/profile-with-preference.dto';
import { PreferenceDocument } from './entities/preference.schema';
import { CreatePreferenceDto } from './dto/create-preference.dto';
import { UpdatePreferenceDto } from './dto/update-preference.dto';
// import { Habit } from './entities/profile.schema';
// import { EducationLevel } from './entities/profile.schema';


@Injectable()
export class ProfilesService {
  constructor(
    @InjectModel(Profile.name)
    private profileModel: Model<ProfileDocument>,
    @InjectModel(Preference.name)
    private readonly preferenceModel: Model<PreferenceDocument>,
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
    // if (dto.city !== undefined) profile.city = dto.city;
    // if (dto.country !== undefined) profile.country = dto.country;
    if (dto.drinking !== undefined) profile.drinking = dto.drinking;
    if (dto.smoking !== undefined) profile.smoking = dto.smoking;
    if (dto.gym !== undefined) profile.gym = dto.gym;
    if (dto.vegan !== undefined) profile.vegan = dto.vegan;

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

    const locationData = await getLocationFromCoordinates(dto.lat, dto.lng);

    profile.city = locationData.city;
    profile.state = locationData.state;
    profile.country = locationData.country;

    // Recalculate completion
    profile.completionPercentage = this.calculateCompletion(profile);

    // Activate if eligible
    if (profile.completionPercentage >= 70) {
      profile.status = ProfileStatus.ACTIVE;
    }

    return profile.save();
  }

  async getMyProfile(userId: string):  Promise<ProfileWithPreference> {
    const userObjectId = new Types.ObjectId(userId);

    const [profile, preference] = await Promise.all([
      this.profileModel.findOne({ userId: userObjectId }).lean(),
      this.preferenceModel.findOne({ userId: userObjectId }).lean(),
    ]);

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    
    return {
      ...profile,
      preference: preference || null,
    };
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
      userId
      bio
      gender
      age
      interests
      heightCm
      religion
      habits
      education
      city
      state
      country
      photos
      primaryPhoto
      likeCount
      `,
      )
      .lean();
  }

  async setPreference(userId: string, dto: CreatePreferenceDto) {
    const preference = await this.preferenceModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      {
        ...dto,
      },
      {
        new: true,
        upsert: true,
      },
    );

    return preference;
  }

  // Get my preference
  async getPreference(userId: string) {
    const preference = await this.preferenceModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    if (!preference) {
      throw new NotFoundException('Preference not found');
    }

    return preference;
  }

  // Update preference
  async updatePreference(userId: string, dto: UpdatePreferenceDto) {
    const preference = await this.preferenceModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      dto,
      { new: true },
    );

    if (!preference) {
      throw new NotFoundException('Preference not found');
    }

    return preference;
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
      !!profile.primaryPhoto,
      !!profile.city,
      !!profile.state,
      !!profile.country,
    ];

    const weight = 100 / checks.length;

    checks.forEach((c) => {
      if (c) completed += weight;
    });

    return Math.min(100, Math.round(completed));
  }
}
