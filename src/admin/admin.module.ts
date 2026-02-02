import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

import { User, UserSchema } from '../users/entities/user.schema';
import { Profile, ProfileSchema } from '../profiles/entities/profile.schema';
import { ProfilesModule } from '../profiles/profiles.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Profile.name, schema: ProfileSchema },
    ]),
    ProfilesModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
