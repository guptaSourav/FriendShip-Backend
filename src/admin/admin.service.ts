import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  User,
  UserDocument,
  VerificationStatus,
} from '../users/entities/user.schema';
import { Profile, ProfileDocument } from '../profiles/entities/profile.schema';
import { ProfilesService } from '../profiles/profiles.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,

    @InjectModel(Profile.name)
    private readonly profileModel: Model<ProfileDocument>,

    private readonly profileService: ProfilesService,
  ) {}

  async getAllUserProfiles(page = 1, limit = 10) {
    return this.profileService.getAllUserProfiles(page, limit);
  }

  async getProfileByUserId(userId: string): Promise<ProfileDocument | null> {
    return this.profileService.getProfileByUserId(userId);
  }

  async verifyUser(userId: string, status: VerificationStatus) {
    // 1️⃣ Validate status
    if (
      ![VerificationStatus.VERIFIED, VerificationStatus.REJECTED].includes(
        status,
      )
    ) {
      throw new BadRequestException('Invalid verification status');
    }

    // 2️⃣ Validate userId
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user id');
    }
    const id = new Types.ObjectId(userId);
    // 3️⃣ Fetch user
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 4️⃣ Ensure user is in PENDING state
    if (user.verificationStatus !== VerificationStatus.PENDING) {
      throw new BadRequestException(
        `User verification is already ${user.verificationStatus}`,
      );
    }

    // 5️⃣ Fetch profile + document
    const profile = await this.profileModel.findOne({ userId: user._id });
    if (!profile || !profile.documentUrl) {
      throw new BadRequestException(
        'User has not uploaded any verification document',
      );
    }

    // 6️⃣ Update verification status
    user.verificationStatus = status;
    user.isVerified = status === VerificationStatus.VERIFIED;

    await user.save();

    return {
      message:
        status === VerificationStatus.VERIFIED
          ? 'User verified successfully'
          : 'User verification rejected',
    };
  }

  async deleteUser(userId: string) {
    // Soft delete user
    const id = new Types.ObjectId(userId);
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.isDeleted = true;
    await user.save();
    return { message: 'User deleted successfully' };
  }

  async restoreUser(userId: string) {
    // Restore soft-deleted user
    const id = new Types.ObjectId(userId);
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.isDeleted = false;
    await user.save();
    return { message: 'User restored successfully' };
  }

  async getDeletedUsers(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.userModel
        .find({ isDeleted: true })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),

      this.userModel.countDocuments({ isDeleted: true }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserAnalytics() {
    const [
      totalUsers,
      activeUsers,
      blockedUsers,
      verifiedUsers,
      pendingVerificationUsers,
      profileStats,
      genderStats,
      documentUploadedCount,
    ] = await Promise.all([
      this.userModel.countDocuments({ isDeleted: false }),

      this.userModel.countDocuments({ isActive: true, isDeleted: false }),

      this.userModel.countDocuments({ isBlocked: true }),

      this.userModel.countDocuments({
        verificationStatus: VerificationStatus.VERIFIED,
      }),

      this.userModel.countDocuments({
        verificationStatus: VerificationStatus.PENDING,
      }),

      this.profileModel.countDocuments({
        completionPercentage: { $gte: 80 },
      }),

      this.profileModel.aggregate([
        {
          $group: {
            _id: '$gender',
            count: { $sum: 1 },
          },
        },
      ]),

      this.profileModel.countDocuments({
        documentUrl: { $ne: null },
      }),
    ]);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        blocked: blockedUsers,
      },

      verification: {
        verified: verifiedUsers,
        pending: pendingVerificationUsers,
        documentUploaded: documentUploadedCount,
      },

      profiles: {
        completed: profileStats,
      },

      genderDistribution: genderStats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
    };
  }

}
