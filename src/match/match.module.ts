// src/match/match.module.ts
import { Module } from '@nestjs/common';
import { MatchService } from './match.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Match, MatchSchema } from './entities/match.schema';
import { MatchController } from './match.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Match.name, schema: MatchSchema }])],
  providers: [MatchService],
    controllers: [MatchController],
  exports: [MatchService], // 👈 important
})
export class MatchModule {}
