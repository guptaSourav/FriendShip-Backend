// src/swipe/swipe.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Swipe, SwipeDocument, SwipeAction } from './entities/swipe.schema';
import { MatchService } from '../match/match.service';
import { Profile, ProfileDocument } from '../profiles/entities/profile.schema';

@Injectable()
export class SwipeService {
  constructor(
    @InjectModel(Swipe.name)
    private swipeModel: Model<SwipeDocument>,
    @InjectModel(Profile.name)
    private profileModel: Model<ProfileDocument>,
    private matchService: MatchService,
  ) {}

  async swipe(
    fromUserId: string,
    dto: { toUserId: string; action: SwipeAction },
  ) {
    if (fromUserId === dto.toUserId) {
      throw new BadRequestException('You cannot swipe yourself');
    }

    const fromId = new Types.ObjectId(fromUserId);
    const toId = new Types.ObjectId(dto.toUserId);

    try {
      // 1. Check if reverse like exists (possible match)
      let isMatch = false;

      if (dto.action === SwipeAction.LIKE) {
        const reverseSwipe = await this.swipeModel.findOne({
          fromUser: toId,
          toUser: fromId,
          action: SwipeAction.LIKE,
        });

        if (reverseSwipe) {
          isMatch = true;
        }
      }

      // 2. Create swipe record
      const swipe = await this.swipeModel.create({
        fromUser: fromId,
        toUser: toId,
        action: dto.action,
      });

      // 3. Increment likeCount if liked
      if (dto.action === SwipeAction.LIKE) {
        await this.profileModel.updateOne(
          { userId: toId },
          { $inc: { likeCount: 1 } },
        );
      }

      // 4. If match detected → create match
      if (isMatch) {
        await this.matchService.createMatch(
          fromUserId,
          dto.toUserId,
          fromUserId,
        );

        return {
          success: true,
          matched: true,
          message: 'It’s a match!',
        };
      }

      // 5. Normal swipe response
      return {
        success: true,
        action: swipe.action,
        swipeId: swipe._id,
      };
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException('You already swiped this profile');
      }
      throw error;
    }
  }
}
