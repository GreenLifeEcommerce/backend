import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}
  async SendOTP(otp: string, email: string, name: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Verify Green Life',
      template: 'sendOTP.template.hbs',
      context: { otp, name },
    });
  }
}
