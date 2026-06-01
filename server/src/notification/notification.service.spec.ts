import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { WsGateway } from 'src/ws/ws.gateway';
import { EVENTS } from './notification.constants';

describe('NotificationService', () => {
  let service: NotificationService;
  let wsGateway: { sendToUser: jest.Mock };

  beforeEach(async () => {
    wsGateway = { sendToUser: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationService, { provide: WsGateway, useValue: wsGateway }],
    }).compile();

    service = module.get(NotificationService);
  });

  // ─── checkStarted ────────────────────────────────────────────
  describe('checkStarted', () => {
    it('sends CHECK_STARTED event', () => {
      service.checkStarted();

      expect(wsGateway.sendToUser).toHaveBeenCalledWith(EVENTS.CHECK_STARTED);
    });
  });

  // ─── checkFailed ─────────────────────────────────────────────
  describe('checkFailed', () => {
    it('sends CHECK_FAILED event with labId and reason', () => {
      service.checkFailed(5, 'Something went wrong');

      expect(wsGateway.sendToUser).toHaveBeenCalledWith(EVENTS.CHECK_FAILED, {
        labId: 5,
        reason: 'Something went wrong',
      });
    });

    it('uses default reason when not provided', () => {
      service.checkFailed(5);

      expect(wsGateway.sendToUser).toHaveBeenCalledWith(EVENTS.CHECK_FAILED, {
        labId: 5,
        reason: 'Неизвестная ошибка',
      });
    });
  });

  // ─── reportsChecked ──────────────────────────────────────────
  describe('reportsChecked', () => {
    it('sends REPORTS_CHECKED event with ids and labId', () => {
      service.reportsChecked([1, 2, 3], 10);

      expect(wsGateway.sendToUser).toHaveBeenCalledWith(EVENTS.REPORTS_CHECKED, {
        ids: [1, 2, 3],
        labId: 10,
      });
    });
  });

  // ─── reportOneStarted ────────────────────────────────────────
  describe('reportOneStarted', () => {
    it('sends REPORT_ONE_STARTED with student, model, id, labId and status=started', () => {
      service.reportOneStarted({
        student: 'Иван Иванов',
        model: 'gpt-4',
        id: 42,
        labId: 3,
      });

      expect(wsGateway.sendToUser).toHaveBeenCalledWith(EVENTS.REPORT_ONE_STARTED, {
        student: 'Иван Иванов',
        model: 'gpt-4',
        id: 42,
        labId: 3,
        status: 'started',
      });
    });
  });

  // ─── reportOneChecked ────────────────────────────────────────
  describe('reportOneChecked', () => {
    it('sends REPORT_ONE_SUCCESS with status=checked', () => {
      service.reportOneChecked({
        student: 'Петр Петров',
        model: 'gemini',
        id: 43,
        labId: 3,
      });

      expect(wsGateway.sendToUser).toHaveBeenCalledWith(EVENTS.REPORT_ONE_SUCCESS, {
        student: 'Петр Петров',
        model: 'gemini',
        id: 43,
        labId: 3,
        status: 'checked',
      });
    });
  });

  // ─── reportOneFailed ─────────────────────────────────────────
  describe('reportOneFailed', () => {
    it('sends REPORT_ONE_FAILED with status=failed', () => {
      service.reportOneFailed({
        student: 'Сидор Сидоров',
        model: 'deepseek',
        id: 44,
        labId: 3,
      });

      expect(wsGateway.sendToUser).toHaveBeenCalledWith(EVENTS.REPORT_ONE_FAILED, {
        student: 'Сидор Сидоров',
        model: 'deepseek',
        id: 44,
        labId: 3,
        status: 'failed',
      });
    });
  });
});
