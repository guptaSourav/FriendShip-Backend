import { Module, forwardRef } from '@nestjs/common';
import { AppGateway } from './app.gateway';
import { AuthModule } from '../auth/auth.module';
import { ChatModule } from '../chats/chats.module';

@Module({
  imports: [forwardRef(() => AuthModule), forwardRef(() => ChatModule)],
  providers: [AppGateway],
  exports: [AppGateway],
})
export class SocketModule {}
