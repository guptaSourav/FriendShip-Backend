// src/common/mail/mail.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  TransactionalEmailsApi,
  TransactionalEmailsApiApiKeys,
} from '@getbrevo/brevo';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly emailApi: TransactionalEmailsApi;

  constructor(private readonly configService: ConfigService) {
    this.emailApi = new TransactionalEmailsApi();

    // ✅ Correct way to set API key
    this.emailApi.setApiKey(
      TransactionalEmailsApiApiKeys.apiKey,
      this.configService.get<string>('BREVO_API_KEY')!,
    );

    this.logger.log('✅ Brevo SDK initialized');
  }

  async sendOtp(to: string, otp: string): Promise<void> {
    await this.emailApi.sendTransacEmail({
      sender: {
        email: this.configService.get<string>('MAIL_FROM'),
        name: this.configService.get<string>('MAIL_FROM_NAME'),
      },
      to: [{ email: to }],
      subject: 'Your OTP Code',
      textContent: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
    });

    this.logger.log(`📧 OTP email sent to ${to}`);
  }
}
