import {
  Injectable,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChatRoom, ChatRoomDocument } from './entities/chat-room.schema';
import { ProfilesService } from '../profiles/profiles.service';
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
    @Inject(forwardRef(() => ProfilesService))
    private readonly profileService: ProfilesService,
  ) {}

  async getOrCreateRoom(userA: string, userB: string) {
    console.log(`Getting or creating room for users ${userA} and ${userB}`);
    const room = await this.chatRoomModel.findOne({
      participants: { $all: [new Types.ObjectId(userA), new Types.ObjectId(userB) ] },
    });

    if (room) return room;

    return this.chatRoomModel.create({
      participants: [new Types.ObjectId(userA), new Types.ObjectId(userB)],
    });
  }

  async sendMessage(senderId: string, receiverId: string, content: string) {
    console.log(`Sending message from ${senderId} to ${receiverId}: ${content}`);
    const matched = await this.matchService.isMatched(senderId, receiverId);
    if (!matched) throw new ForbiddenException('Users are not matched');
    
    const room = await this.getOrCreateRoom(senderId, receiverId);
    console.log(`Using room ${room._id} for users ${senderId} and ${receiverId}`);
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
    const myId = new Types.ObjectId(userId);

    const rooms = await this.chatRoomModel
      .find({ participants: myId })
      .sort({ lastMessageAt: -1 })
      .lean();

    // collect other participant ids
    const otherUserIds: Types.ObjectId[] = rooms
      .map((room) => room.participants.find((p) => !p.equals(myId)))
      .filter((id): id is Types.ObjectId => id !== undefined);

    // fetch profiles in parallel
    const profiles = await Promise.all(
      otherUserIds.map((id) =>
        this.profileService.getProfileByUserId(id.toString()),
      ),
    );
    
    // merge room + profile
    return rooms.map((room, index) => ({
      _id: room._id,
      lastMessage: room.lastMessage,
      lastMessageAt: room.lastMessageAt,
      otherUser: profiles[index],
    }));
  }

  async getMessages(roomId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const messages = await this.messageModel
      .find({ chatRoomId: new Types.ObjectId(roomId) })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    console.log(`Fetched ${messages.length} messages for room ${roomId}, page ${page}`);
      
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
