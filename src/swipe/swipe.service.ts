// src/swipe/swipe.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Swipe, SwipeDocument, SwipeAction } from './entities/swipe.schema';
import { MatchService } from '../match/match.service';

@Injectable()
export class SwipeService {
  constructor(
    @InjectModel(Swipe.name)
    private swipeModel: Model<SwipeDocument>,
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
      // Check if the other user already liked you → create match
      if (dto.action === SwipeAction.LIKE) {
        const reverseSwipe = await this.swipeModel.findOne({
          fromUser: toId,
          toUser: fromId,
          action: SwipeAction.LIKE,
        });

        if (reverseSwipe) {
          await this.matchService.createMatch(fromUserId, dto.toUserId, fromUserId);

          return {
            success: true,
            matched: true,
            message: 'It’s a match!',
          };
        }
      }
      
      // Create the swipe record
      const swipe = await this.swipeModel.create({
        fromUser: fromId,
        toUser: toId,
        action: dto.action,
      });

      return {
        success: true,
        action: swipe.action,
        swipeId: swipe._id,
      };
    } catch (error) {
      // Handle duplicate swipe
      if (error.code === 11000) {
        throw new BadRequestException('You already swiped this profile');
      }
      throw error;
    }
  }

  async getTotalLikes(userId: string): Promise<number> {
    const count = await this.swipeModel.countDocuments({
      toUser: new Types.ObjectId(userId),
      action: SwipeAction.LIKE,
    });
    return count;
  }
}
