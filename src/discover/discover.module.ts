import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DiscoverService } from './discover.service';
import { DiscoverController } from './discover.controller';
import { Profile, ProfileSchema } from '../profiles/entities/profile.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Profile.name, schema: ProfileSchema },
    ]),
  ],
  controllers: [DiscoverController],
  providers: [DiscoverService],
})
export class DiscoverModule {}
