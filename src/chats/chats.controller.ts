import { Controller, Get, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ChatService } from './chats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';


@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('rooms')
  getMyRooms(@Req() req) {
    return this.chatService.getMyRooms(req.user.userId);
  }

  @Get('messages/:roomId')
  getMessages(
    @Param('roomId') roomId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.chatService.getMessages(roomId, Number(page), Number(limit));
  }
}
