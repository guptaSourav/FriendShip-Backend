import { Injectable, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChatRoom, ChatRoomDocument } from './entities/chat-room.schema';
import {
  Message,
  MessageStatus,
  MessageDocument,
} from './entities/message.schema';
import { MatchService } from '../match/match.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatRoom.name)
    private chatRoomModel: Model<ChatRoomDocument>,
  
    @InjectModel(Message.name)
    private messageModel: Model<MessageDocument>,
    @Inject(forwardRef(() => MatchService))
    private readonly matchService: MatchService,
  ) {}

  async getOrCreateRoom(userA: string, userB: string) {
    const room = await this.chatRoomModel.findOne({
      participants: { $all: [userA, userB] },
    });

    if (room) return room;

    return this.chatRoomModel.create({
      participants: [new Types.ObjectId(userA), new Types.ObjectId(userB)],
    });
  }

  async sendMessage(senderId: string, receiverId: string, content: string) {
    const matched = await this.matchService.isMatched(senderId, receiverId);
    if (!matched) throw new ForbiddenException('Users are not matched');

    const room = await this.getOrCreateRoom(senderId, receiverId);

    const message = await this.messageModel.create({
      chatRoomId: room._id,
      senderId,
      receiverId,
      content,
      status: MessageStatus.SENT,
    });

    room.lastMessage = content;
    room.lastMessageAt = new Date();
    await room.save();

    return { room, message };
  }

  async getMyRooms(userId: string) {
    return this.chatRoomModel
      .find({ participants: userId })
      .sort({ lastMessageAt: -1 });
  }

  async getMessages(roomId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const messages = await this.messageModel
      .find({ chatRoomId: roomId })
      .sort({ createdAt: -1 }) // newest first
      .skip(skip)
      .limit(limit);

    return messages.reverse();
  }

  async markAsSeen(roomId: string, userId: string) {
    await this.messageModel.updateMany(
      {
        chatRoomId: roomId,
        receiverId: userId,
        status: MessageStatus.SENT,
      },
      { status: MessageStatus.SEEN },
    );
  }

  async markAsSeenAndGetParticipants(roomId: string, userId: string) {
    await this.markAsSeen(roomId, userId);

    const room = await this.chatRoomModel.findById(roomId);
    return room?.participants.map((p) => p.toString()) || [];
  }
}
