import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { S3Module } from './s3/s3.module';
import { RedisModule } from './redis/redis.module';
import { DiscoverModule } from './discover/discover.module';
import { AuthModule } from './auth/auth.module';
import { SwipeModule } from './swipe/swipe.module';
import { SocketModule } from './socket/socket.module';
import { NotificationsModule } from './notifications/notifications.module';

import { RedisTestController } from './redis/redis-test.controller';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    S3Module,
    RedisModule,
    AuthModule,
    DiscoverModule,
    SwipeModule,
    SocketModule,
    NotificationsModule,
  ],
  controllers: [RedisTestController],
})
export class AppModule {}
