import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SwipeService } from './swipe.service';
import { SwipeDto } from './dto/swipe.dto';

@Controller('swipe')
export class SwipeController {
  constructor(private readonly swipeService: SwipeService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  swipe(@Req() req, @Body() dto: SwipeDto) {
    return this.swipeService.swipe(req.user.userId, dto);
  }
}
