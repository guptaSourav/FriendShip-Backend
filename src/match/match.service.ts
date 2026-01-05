import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Match, MatchDocument } from './entities/match.schema';

@Injectable()
export class MatchService {
  constructor(
    @InjectModel(Match.name)
    private matchModel: Model<MatchDocument>,
  ) {}

  async createMatch(userA: string, userB: string) {
    const [user1, user2] = userA < userB ? [userA, userB] : [userB, userA];

    try {
      return await this.matchModel.create({
        user1: new Types.ObjectId(user1),
        user2: new Types.ObjectId(user2),
      });
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
}
