import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private onlineUsers = new Map<string, Set<string>>();

  constructor(private readonly authService: AuthService) {}

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
}
