import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DatabaseService } from 'src/database/database.service';
import { subDays } from 'date-fns';

interface EmailService {
  sendEmail: (options: {
    to: string;
    subject: string;
    text: string;
  }) => Promise<void>;
}

@Injectable()
export class PasswordReminderService {
  private readonly logger = new Logger(PasswordReminderService.name);

  constructor(
    private prisma: DatabaseService,
    @Inject('EMAIL_SERVICE') private emailService: EmailService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async handlePasswordReminder() {
    const today = new Date();
    const reminderDate = subDays(today, -3); // 3 days from now

    const users = await this.prisma.user.findMany({
      where: {
        password_expires_at: {
          lte: reminderDate, // Password expires in 3 days
          gte: today, // But not already expired
        },
      },
    });

    for (const user of users) {
      await this.emailService.sendEmail({
        to: user.email,
        subject: 'Password Expiration Reminder',
        text: this.generateReminderEmail(user.name),
      });

      this.logger.log(`Reminder sent to ${user.email}`);
    }
  }

  private generateReminderEmail(name: string): string {
    return `
Hello ${name},

Your password will expire in 3 days.

Please change your password as soon as possible to avoid being locked out.

Thank you,
Support Team
    `;
  }
}
