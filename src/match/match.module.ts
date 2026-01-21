import { Module, forwardRef } from '@nestjs/common';
import { MatchService } from './match.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Match, MatchSchema } from './entities/match.schema';
import { MatchController } from './match.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { ChatModule } from '../chats/chats.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Match.name, schema: MatchSchema }]),
      forwardRef(() => NotificationsModule),
      forwardRef(() => ChatModule),
  ],
  providers: [MatchService],
  controllers: [MatchController],
  exports: [MatchService],
})
export class MatchModule {}