import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Match, MatchDocument } from './entities/match.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.schema';
import { ChatService } from '../chats/chats.service';

@Injectable()
export class MatchService {
  constructor(
    @InjectModel(Match.name)
    private matchModel: Model<MatchDocument>,
    private readonly notificationService: NotificationsService,
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
  ) {}

  async createMatch(userA: string, userB: string, triggeredBy: string) {
    const [user1, user2] = userA < userB ? [userA, userB] : [userB, userA];
    const waitingUser = triggeredBy === user1 ? user2 : user1;

    try {
      const match = await this.matchModel.create({
        user1: new Types.ObjectId(user1),
        user2: new Types.ObjectId(user2),
      });

      await this.notificationService.createNotification({
        receiver: waitingUser,
        sender: triggeredBy,
        type: NotificationType.MATCH,
        title: 'It’s a Match! 🎉',
        body: 'Someone you liked just liked you back!',
        entityId: match._id.toString(),
        platform: 'in_app',
      });
      // ✅ Create chat room immediately
      await this.chatService.getOrCreateRoom(user1, user2);

      return match;
    } catch (err) {
      if (err.code === 11000) {
        return null; // Match already exists
      }
      throw err;
    }
  }

  async getMyMatches(userId: string) {
    const matches = await this.matchModel
      .find({
        $or: [
          { user1: new Types.ObjectId(userId) },
          { user2: new Types.ObjectId(userId) },
        ],
        isActive: true,
      })
      .populate({
        path: 'user1',
        select: 'email role',
        populate: { path: 'profile', select: 'name primaryPhoto dateOfBirth' },
      })
      .populate({
        path: 'user2',
        select: 'email role',
        populate: { path: 'profile', select: 'name primaryPhoto dateOfBirth' },
      });
    // Converts to plain JS objects

    // Map to return only the "other user" info
    return matches.map((match) => {
      const otherUser =
        match.user1._id.toString() === userId ? match.user2 : match.user1;

      return {
        matchId: match._id,
        user: otherUser, // Includes profile: { name, age, primaryPhoto }
        matchedAt: match.createdAt,
      };
    });
  }

  async isMatched(userA: string, userB: string): Promise<boolean> {
    console.log(`Checking match status between ${userA} and ${userB}`);
    const match = await this.matchModel.findOne({
      $or: [
        { user1: new Types.ObjectId(userA), user2: new Types.ObjectId(userB) },
        { user1: new Types.ObjectId(userB), user2: new Types.ObjectId(userA) },
      ],
      isActive: true,
    });

    console.log(`Match found: ${match ? 'Yes' : 'No'}`);

    return !!match;
  }
}
