// src/redis/redis-test.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { RedisService } from './redis.service';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('redis-test')
export class RedisTestController {
  constructor(private readonly redisService: RedisService) {}
  
  // @UseGuards(JwtAuthGuard)
  @Get('set')
  async setValue() {
    await this.redisService.set('hello', 'world', 30); // 30 sec TTL
    return { message: 'Key set in Redis' };
  }

  @Get('get')
  async getValue() {
    const value = await this.redisService.get('hello');
    return { value };
  }

  @Get('del')
  async deleteValue() {
    await this.redisService.del('hello');
    return { message: 'Key deleted' };
  }
}
