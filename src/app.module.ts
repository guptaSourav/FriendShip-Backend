import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { S3Module } from './s3/s3.module';
import { RedisModule } from './redis/redis.module';
import { RedisTestController } from './redis/redis-test.controller';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [ConfigModule, DatabaseModule, S3Module, RedisModule, AuthModule],
  controllers: [RedisTestController],
})
export class AppModule {}
