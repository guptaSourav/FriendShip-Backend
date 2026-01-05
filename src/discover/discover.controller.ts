import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DiscoverService } from './discover.service';
import { DiscoverDto } from './dto/discover.dto';

@Controller('discover')
@UseGuards(JwtAuthGuard)
export class DiscoverController {
  constructor(private readonly discoverService: DiscoverService) {}

  @Get()
  discover(@Req() req, @Query() dto: DiscoverDto) {
    return this.discoverService.discover(req.user.userId, dto);
  }
}
