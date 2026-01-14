import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SwipeService } from './swipe.service';
import { SwipeController } from './swipe.controller';
import { Swipe, SwipeSchema } from './entities/swipe.schema';
import { MatchModule } from '../match/match.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Swipe.name, schema: SwipeSchema }]),
    forwardRef(() => MatchModule),
  ],
  controllers: [SwipeController],
  providers: [SwipeService],
})
export class SwipeModule {}
