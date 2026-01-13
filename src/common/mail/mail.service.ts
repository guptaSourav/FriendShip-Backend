// src/common/mail/mail.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: Number(this.configService.get<number>('SMTP_PORT')),
      secure: this.configService.get<string>('SMTP_SECURE') === 'true',
      auth: {
        user: this.configService.get<string>('EMAIL'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
    });

    this.logger.log('✅ Nodemailer transporter initialized');
  }

  async sendOtp(to: string, otp: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"PhysNxt" <${this.configService.get<string>('EMAIL')}>`,
        to,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
      });

      this.logger.log(`📧 OTP email sent to ${to}`);
    } catch (error) {
      this.logger.error('❌ Failed to send OTP email', error);
      throw error;
    }
  }
}
