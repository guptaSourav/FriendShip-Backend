import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Block, BlockSchema } from './entities/blocks.schema';
import { BlocksService } from './blocks.service';
import { BlockController } from './blocks.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Block.name, schema: BlockSchema }
    ])
  ],
  controllers: [BlockController],
  providers: [BlocksService],
  exports: [BlocksService],
})
export class BlockModule {}
