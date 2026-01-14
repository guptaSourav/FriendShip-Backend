import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Block, BlockDocument } from '../blocks/entities/blocks.schema';
import { BlockUserDto } from './dto/block-user.dto';


@Injectable()
export class BlocksService {
  constructor(
    @InjectModel(Block.name)
    private readonly blockModel: Model<BlockDocument>,
  ) {}

  async blockUser(blockerId: string, dto: BlockUserDto) {
    if (blockerId === dto.blockedUserId) {
      throw new BadRequestException('You cannot block yourself');
    }

    try {
      return await this.blockModel.create({
        blocker: new Types.ObjectId(blockerId),
        blocked: new Types.ObjectId(dto.blockedUserId),
        reason: dto.reason,
      });
    } catch (err) {
      throw new BadRequestException('User already blocked');
    }
  }

  async unblockUser(blockerId: string, blockedUserId: string) {
    return this.blockModel.deleteOne({
      blocker: new Types.ObjectId(blockerId),
      blocked: new Types.ObjectId(blockedUserId),
    });
  }

  async isBlocked(userA: string, userB: string): Promise<boolean> {
    const exists = await this.blockModel.exists({
      $or: [
        { blocker: new Types.ObjectId(userA), blocked: new Types.ObjectId(userB) },
        { blocker: new Types.ObjectId(userB), blocked: new Types.ObjectId(userA) },
      ],
    });
    
    return !!exists;
  }

  async getBlockedUsers(userId: string) {
    const blockList = await this.blockModel
      .find({ blocker:  new Types.ObjectId(userId)})
      .populate('blocked', 'email')
      .select('blocked reason createdAt');

      console.log(blockList);
    return blockList;
  }
}
