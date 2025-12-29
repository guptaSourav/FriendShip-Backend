// src/redis/redis.service.ts
import { Injectable, Inject } from '@nestjs/common';
import type { RedisClientType } from 'redis';


@Injectable()
export class RedisService {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly client: RedisClientType,
  ) {}

  async set(key: string, value: any, ttl: number) {
    await this.client.set(key, JSON.stringify(value), {
      EX: ttl,
    });
  }

  async get(key: string) {
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async del(key: string) {
    await this.client.del(key);
  }
}
