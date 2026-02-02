import { Module, forwardRef} from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Profile, ProfileSchema } from './entities/profile.schema';
import { Preference, PreferenceSchema } from './entities/preference.schema';
import {UsersModule} from '../users/users.module';
import {S3Module} from '../s3/s3.module';
// import { SwipeModule } from '../swipe/swipe.module';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: Profile.name, schema: ProfileSchema }]),
    MongooseModule.forFeature([{ name: Preference.name, schema: PreferenceSchema }]),
    forwardRef(() => S3Module),
    forwardRef(() => UsersModule),
    // forwardRef(() => SwipeModule),
  ],
  controllers: [ProfilesController],
  providers: [ProfilesService],
  exports: [ProfilesService],
})
export class ProfilesModule {}
