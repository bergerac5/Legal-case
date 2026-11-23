import { Test } from '@nestjs/testing';
import { PasswordReminderService } from './passwordRemainderService';
import { DatabaseService } from 'src/database/database.service';
import { subDays } from 'date-fns';

// Mock the DatabaseService (Prisma)
const mockPrisma = {
  user: {
    findMany: jest.fn().mockResolvedValue([]),
  },
};

// Mock EmailService
const mockEmailService = {
  sendEmail: jest.fn().mockResolvedValue(true),
};

describe('PasswordReminderService', () => {
  let service: PasswordReminderService;
  let emailService: typeof mockEmailService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PasswordReminderService,
        { provide: DatabaseService, useValue: mockPrisma },
        { provide: 'EMAIL_SERVICE', useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<PasswordReminderService>(PasswordReminderService);
    emailService = module.get('EMAIL_SERVICE');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handlePasswordReminder', () => {
    it('should send reminders to users whose passwords expire in 3 days', async () => {
      const today = new Date();
      const reminderDate = subDays(today, -3);

      // Mock users with expiring passwords
      const mockUsers = [
        {
          id: '422427d6-69df-444c-a3ca-5c30bdeb688d',
          email: 'birakarama5@gmail.com',
          name: 'Bergerac Irakarama',
          password_expires_at: reminderDate,
        },
      ];
      mockPrisma.user.findMany.mockResolvedValue(mockUsers);

      await service.handlePasswordReminder();

      // Verify Prisma query
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        where: {
          password_expires_at: {
            lte: reminderDate,
            gte: today,
          },
        },
      });

      // Verify email was sent
      expect(emailService.sendEmail).toHaveBeenCalledWith({
        to: 'birakarama5@gmail.com',
        subject: 'Password Expiration Reminder',
        text: expect.stringContaining('Your password will expire in 3 days'),
      });
    });

    it('should not send emails if no users match the criteria', async () => {
      mockPrisma.user.findMany.mockResolvedValue([]);
      await service.handlePasswordReminder();
      expect(emailService.sendEmail).not.toHaveBeenCalled();
    });
  });
});
