import {
  Body,
  Controller,
  Get,
  Patch,
  Param,
  Req,
  UseGuards,
  Post,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getMyNotifications(@Req() req) {
    return this.notificationsService.getUserNotifications(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createNotification(@Body() dto: CreateNotificationDto) {
    return this.notificationsService.createNotification(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('read/:id')
  async markRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('read-all')
  async markAllRead(@Req() req) {
    return this.notificationsService.markAllAsRead(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('unread-count')
  async getUnreadCount(@Req() req) {
    return this.notificationsService.getUnreadCount(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  async getMyNotification(@Req() req) {
    return this.notificationsService.getUserNotifications(req.user.userId);
  }
}
