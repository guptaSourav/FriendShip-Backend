import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FeedService } from './feed.service';

@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}


  @Get()
  @UseGuards(JwtAuthGuard)
  async getFeed(@Req() req, @Query('page') page = 1) {
    return this.feedService.getFeed(req.user.userId, Number(page));
  }
}
