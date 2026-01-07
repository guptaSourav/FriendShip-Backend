import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Notification,
  NotificationDocument,
  NotificationType,
} from './entities/notification.schema';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { AppGateway } from '../socket/app.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
    private readonly appGateway: AppGateway,
  ) {}
  
  async createNotification(data: CreateNotificationDto) {
    const receiverId = new Types.ObjectId(data.receiver);
    const senderId = data.sender ? new Types.ObjectId(data.sender) : undefined;
    const entityId = data.entityId
      ? new Types.ObjectId(data.entityId)
      : undefined;

    const notificationData = {
      ...data,
      receiver: receiverId,
      sender: senderId,
      entityId: entityId,
      platform: data.platform || 'in_app',
    };

    // Save to DB first
    const notification = await this.notificationModel.create(notificationData);

    // Emit via socket if in_app or both
    if (
      notification.platform === 'in_app' ||
      notification.platform === 'both'
    ) {
      console.log(`📣 Emitting notification to user: ${notification.receiver}`);
      this.appGateway.emitToUser(
        notification.receiver.toString(),
        'notification',
        notification,
      );
    }

    return notification;
  }

  async getUserNotifications(userId: string) {
    return this.notificationModel
      .find({ receiver: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 });
  }

  async markAsRead(notificationId: string) {
    return this.notificationModel.findByIdAndUpdate(
      new Types.ObjectId(notificationId),
      { isRead: true },
      { new: true },
    );
  }

  async markAllAsRead(userId: string) {
    return this.notificationModel.updateMany(
      { receiver: new Types.ObjectId(userId), isRead: false },
      { isRead: true },
    );
  }

  async getUnreadCount(userId: string) {
    return this.notificationModel.countDocuments({
      receiver: new Types.ObjectId(userId),
      isRead: false,
    });
  }
}
