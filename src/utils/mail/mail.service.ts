import { Injectable } from '@nestjs/common';
import { error } from 'console';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      auth: {
        user: process.env.USERMAIL,
        pass: process.env.USERPASS,
      },
    });
  }

  async sendMail(email: string, subject: string, content: string) {
    try {
      await Promise.all([
        this.transporter.sendMail({
          from: process.env.USERMAIL,
          to: email,
          subject,
          html: content,
        }),
      ]);
    } catch (err) {
      console.error('메일 전송 중 오류가 발생했습니다.', err);
    }
  }
}
