import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FeedService } from './feed.service';
import { FeedController } from './feed.controller';
import { Profile, ProfileSchema } from '../profiles/entities/profile.schema';
import {
  Preference,
  PreferenceSchema,
} from '../profiles/entities/preference.schema';
import { Swipe, SwipeSchema } from '../swipe/entities/swipe.schema';
import { Match, MatchSchema } from '../match/entities/match.schema';
import { Block, BlockSchema } from '../blocks/entities/blocks.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Profile.name, schema: ProfileSchema },
      { name: Preference.name, schema: PreferenceSchema },
      { name: Swipe.name, schema: SwipeSchema },
      { name: Match.name, schema: MatchSchema },
      { name: Block.name, schema: BlockSchema },
    ]),
  ],
  providers: [FeedService],
  controllers: [FeedController],
})
export class FeedModule {}
