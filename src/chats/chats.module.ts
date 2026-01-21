import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatService } from './chats.service';
import { ChatController } from './chats.controller';
import { ChatRoom, ChatRoomSchema } from './entities/chat-room.schema';
import { Message, MessageSchema } from './entities/message.schema';
import { MatchModule } from '../match/match.module';
import { ProfilesModule } from '../profiles/profiles.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChatRoom.name, schema: ChatRoomSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
    forwardRef(() => MatchModule),
    forwardRef(() => ProfilesModule),
  ],
  providers: [ChatService],
  controllers: [ChatController],
  exports: [ChatService],
})
export class ChatModule {}
