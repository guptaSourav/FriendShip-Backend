import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';
import { ChatService } from '../chats/chats.service';
import { SocketEvents } from './socket.types';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private onlineUsers = new Map<string, Set<string>>();

  constructor(
    private readonly authService: AuthService,
    private readonly chatService: ChatService,
  ) {}

  async handleConnection(socket: Socket) {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        throw new Error('Token missing');
      }

      const payload = this.authService.verifyAccessToken(token);
      const userId = payload.sub || payload.id;

      socket.data.userId = userId;

      if (!this.onlineUsers.has(userId)) {
        this.onlineUsers.set(userId, new Set());
      }

      let sockets = this.onlineUsers.get(userId);

      if (!sockets) {
        sockets = new Set<string>();
        this.onlineUsers.set(userId, sockets);
      }

      sockets.add(socket.id);

      console.log(`🟢 Socket connected: ${userId}`);
    } catch (error) {
      console.log('❌ Socket authentication failed');
      socket.disconnect();
    }
  }

  handleDisconnect(socket: Socket) {
    const userId = socket.data.userId;
    if (!userId) return;

    const sockets = this.onlineUsers.get(userId);
    if (!sockets) return;

    sockets.delete(socket.id);

    if (sockets.size === 0) {
      this.onlineUsers.delete(userId);
    }
  }

  // used later by chat & notification
  emitToUser(userId: string, event: string, payload: any) {
    console.log(`📣 Emitting event "${event}" to user: ${userId}`);
    const sockets = this.onlineUsers.get(userId);
    console.log('Sockets:', sockets);
    if (!sockets) return;

    sockets.forEach((socketId) => {
      this.server.to(socketId).emit(event, payload);
    });
  }

  emitToRoom(roomId: string, event: string, payload: any) {
    this.server.to(roomId).emit(event, payload);
  }

  // ---------------- Chat Events ----------------

  @SubscribeMessage(SocketEvents.JOIN_CHAT)
  async handleJoinChat(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { roomId: string; page?: number; limit?: number },
  ) {
    const userId = socket.data.userId;

    // Join socket.io room for easier broadcast
    socket.join(data.roomId);

    // Fetch messages
    const messages = await this.chatService.getMessages(
      data.roomId,
      data.page || 1,
      data.limit || 20,
    );

    this.emitToUser(userId, SocketEvents.CHAT_HISTORY, {
      roomId: data.roomId,
      messages,
    });
  }

  @SubscribeMessage(SocketEvents.LOAD_MORE_MESSAGES)
  async handleLoadMoreMessages(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { roomId: string; page: number; limit?: number },
  ) {
    const userId = socket.data.userId;

    const messages = await this.chatService.getMessages(
      data.roomId,
      data.page,
      data.limit || 20,
    );

    this.emitToUser(userId, SocketEvents.MORE_CHAT_HISTORY, {
      roomId: data.roomId,
      messages,
    });
  }

  @SubscribeMessage(SocketEvents.MESSAGE_SEND)
  async handleSendMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { receiverId: string; content: string },
  ) {
    const senderId = socket.data.userId;

    const { room, message } = await this.chatService.sendMessage(
      senderId,
      data.receiverId,
      data.content,
    );

    // Ensure both sender & receiver join the room
    socket.join(room._id.toString());

    // Emit confirmation to sender
    this.emitToUser(senderId, SocketEvents.MESSAGE_SENT, {
      roomId: room._id,
      message,
    });

    // Emit to receiver in real-time
    this.emitToUser(data.receiverId, SocketEvents.MESSAGE_RECEIVED, {
      roomId: room._id,
      message,
    });
  }

  @SubscribeMessage(SocketEvents.TYPING_START)
  handleTypingStart(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { toUserId: string },
  ) {
    const fromUser = socket.data.userId;
    this.emitToUser(data.toUserId, SocketEvents.TYPING_START, { fromUser });
  }

  @SubscribeMessage(SocketEvents.TYPING_STOP)
  handleTypingStop(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { toUserId: string },
  ) {
    const fromUser = socket.data.userId;
    this.emitToUser(data.toUserId, SocketEvents.TYPING_STOP, { fromUser });
  }

  @SubscribeMessage(SocketEvents.MESSAGE_READ)
  async handleMessageRead(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const userId = socket.data.userId;

    // Let service mark messages as seen and get participants
    const participants = await this.chatService.markAsSeenAndGetParticipants(
      data.roomId,
      userId,
    );

    // Notify all participants
    participants?.forEach((p) =>
      this.emitToUser(p.toString(), SocketEvents.MESSAGE_READ, {
        roomId: data.roomId,
        userId,
      }),
    );
  }
}
