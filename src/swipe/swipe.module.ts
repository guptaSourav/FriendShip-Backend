import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SwipeService } from './swipe.service';
import { SwipeController } from './swipe.controller';
import { Swipe, SwipeSchema } from './entities/swipe.schema';
import { MatchModule } from '../match/match.module';
import { Profile, ProfileSchema } from '../profiles/entities/profile.schema';
import {NotificationsModule} from "../notifications/notifications.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Swipe.name, schema: SwipeSchema },
      { name: Profile.name, schema: ProfileSchema },
    ]),

    forwardRef(() => MatchModule),
    forwardRef(() => NotificationsModule),
  ],
  controllers: [SwipeController],
  providers: [SwipeService],
})
export class SwipeModule {}
