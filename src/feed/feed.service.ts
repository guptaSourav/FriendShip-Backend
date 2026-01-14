import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  Profile,
  ProfileDocument,
  ProfileStatus,
} from '../profiles/entities/profile.schema';
import {
  Preference,
  PreferenceDocument,
} from '../profiles/entities/preference.schema';
import { Swipe, SwipeDocument } from '../swipe/entities/swipe.schema';
import { Match, MatchDocument } from '../match/entities/match.schema';
import { Block, BlockDocument } from '../blocks/entities/blocks.schema';

@Injectable()
export class FeedService {
  constructor(
    @InjectModel(Profile.name)
    private readonly profileModel: Model<ProfileDocument>,

    @InjectModel(Preference.name)
    private readonly prefModel: Model<PreferenceDocument>,

    @InjectModel(Swipe.name)
    private readonly swipeModel: Model<SwipeDocument>,

    @InjectModel(Match.name)
    private readonly matchModel: Model<MatchDocument>,

    @InjectModel(Block.name)
    private readonly blockModel: Model<BlockDocument>,
  ) {}

  async getFeed(userId: string, page = 1, limit = 20) {
    const userObjectId = new Types.ObjectId(userId);

    // 1. Load user preference
    const pref = await this.prefModel.findOne({ userId: userObjectId });

    // 2. Base filter
    const filter: any = {
      userId: { $ne: userObjectId },
      isVisible: true,
      status: ProfileStatus.ACTIVE,
    };

    // 3. Apply preference filters
    if (pref) {
      // Age filter via DOB
      const today = new Date();

      const minDob = new Date(today);
      minDob.setFullYear(today.getFullYear() - pref.maxAge); // oldest date
      const maxDob = new Date(today);
      maxDob.setFullYear(today.getFullYear() - pref.minAge);

      filter.dateOfBirth = { $gte: minDob, $lte: maxDob };

      if (pref.preferredGender?.length) {
        filter.gender = { $in: pref.preferredGender };
      }

      if (pref.preferredReligion) {
        filter.religion = pref.preferredReligion;
      }

      if (pref.educationLevels?.length) {
        filter.education = { $in: pref.educationLevels };
      }

      if (!pref.allowSmoking) filter.smoking = false;
      if (!pref.allowDrinking) filter.drinking = false;
      if (!pref.allowVegan) filter.vegan = false;
      if (!pref.allowGym) filter.gym = false;
    }

    // 4. Exclude already swiped users
    const swipes = await this.swipeModel
      .find({ fromUser: userObjectId })
      .select('toUser');

    const swipedIds = swipes.map((s) => s.toUser);

    // 5. Exclude matched users
    const matches = await this.matchModel.find({
      $or: [{ user1: userObjectId }, { user2: userObjectId }],
      isActive: true,
    });

    const matchedIds = matches.map((m) => {
      return m.user1.equals(userObjectId) ? m.user2 : m.user1;
    });

    // 6. Exclude blocked users
    const blocks = await this.blockModel.find({
      $or: [{ blocker: userObjectId }, { blocked: userObjectId }],
    });

    const blockedIds = blocks.map((b) => {
      return b.blocker.equals(userObjectId) ? b.blocked : b.blocker;
    });

    // 7. Combine all excluded IDs
    filter.userId.$nin = [
      ...swipedIds,
      ...matchedIds,
      ...blockedIds,
      userObjectId,
    ];

    // 8. Fetch feed
    const profiles = await this.profileModel
      .find(filter, { location: 0 })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const feed = profiles.map((p) => ({
      ...p.toObject(),
      primaryPhoto: p.primaryPhoto || p.photos[0] || null,
    }));

    return {
      page,
      limit,
      count: feed.length,
      profiles:feed,
    };
  }
}
