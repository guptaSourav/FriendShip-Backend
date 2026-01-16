import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Profile,
  ProfileDocument,
  ProfileStatus,
} from '../profiles/entities/profile.schema';
import { DiscoverDto } from './dto/discover.dto';

@Injectable()
export class DiscoverService {
  constructor(
    @InjectModel(Profile.name)
    private profileModel: Model<ProfileDocument>,
  ) {}

  async discover(userId: string, dto: DiscoverDto) {
    const myProfile = await this.profileModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    if (!myProfile || !myProfile.location) {
      throw new Error('Location not set');
    }

    const {
      gender,
      distanceKm = 10,
      minAge,
      maxAge,
      page = 1,
      limit = 10,
    } = dto;

    const now = new Date();

    const pipeline: any[] = [
      {
        $geoNear: {
          near: myProfile.location,
          key: 'location',
          distanceField: 'distance',
          spherical: true,
        },
      },
      {
        $match: {
          distance: { $lte: distanceKm * 1000 },
        },
      },
      {
        $match: {
          userId: { $ne: new Types.ObjectId(userId) },
          status: ProfileStatus.ACTIVE,
          isVisible: true,
          ...(gender && { gender }),
        },
      },
    ];
    
    // Age filter
    if (minAge || maxAge) {
      const minDob = maxAge
        ? new Date(now.getFullYear() - maxAge, now.getMonth(), now.getDate())
        : null;

      const maxDob = minAge
        ? new Date(now.getFullYear() - minAge, now.getMonth(), now.getDate())
        : null;

      pipeline.push({
        $match: {
          ...(minDob && { dateOfBirth: { $gte: minDob } }),
          ...(maxDob && { dateOfBirth: { $lte: maxDob } }),
        },
      });
    }

    pipeline.push(
      { $skip: (page - 1) * limit },
      { $limit: limit },
      {
        $addFields: {
          age: {
            $dateDiff: {
              startDate: '$dateOfBirth',
              endDate: '$$NOW',
              unit: 'year',
            },
          },
        },
      },
      {
        $project: {
          userId: 1,
          name: 1,
          age: 1,
          gender: 1,
          bio: 1,
          photos: 1,
          primaryPhoto: 1,
          distance: { $round: [{ $divide: ['$distance', 1000] }, 1] },
        },
      },
    );

    return this.profileModel.aggregate(pipeline);
  }
}
