import { Controller, Post, Delete, Get, Body, Param, Req, UseGuards } from '@nestjs/common';
import { BlocksService } from './blocks.service';
import { BlockUserDto } from './dto/block-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';


@Controller('blocks')

export class BlockController {
  constructor(private readonly blockService: BlocksService) {}


  @UseGuards(JwtAuthGuard)
  @Post()
  blockUser(@Req() req, @Body() dto: BlockUserDto) {
    return this.blockService.blockUser(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':blockedUserId')
  unblockUser(@Req() req, @Param('blockedUserId') blockedUserId: string) {
    return this.blockService.unblockUser(req.user.userId, blockedUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-all-blocked-users')
  getMyBlockedUsers(@Req() req) {
    return this.blockService.getBlockedUsers(req.user.userId);
  }

  @Get('is-blocked/:userA/:userB')
  async isBlocked(
    @Param('userA') userA: string,
    @Param('userB') userB: string,
  ) {
    const blocked =  await this.blockService.isBlocked(userA, userB);
    return { blocked };
  }
}
