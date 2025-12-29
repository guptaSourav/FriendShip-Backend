// src/redis/redis.module.ts
import { Module, Global } from '@nestjs/common';
import { createClient } from 'redis';
import { RedisService } from './redis.service';

@Global() // so you can use RedisService anywhere
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: async () => {
        const client = createClient({
          socket: {
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT),
            tls: false,
          },
          username: 'default',
          password: process.env.REDIS_PASSWORD,
        });

        client.on('error', (err) => {
          console.error('❌ Redis error:', err);
        });

        await client.connect();
        console.log('✅ Redis connected');

        return client;
      },
    },
    RedisService,
  ],
  exports: [RedisService],
})
export class RedisModule {}
