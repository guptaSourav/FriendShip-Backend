// src/common/mail/mail.module.ts
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule], // so ConfigService works
  providers: [MailService],
  exports: [MailService], // make it available outside
})
export class MailModule {}
