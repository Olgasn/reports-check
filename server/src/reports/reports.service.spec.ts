import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { FileService } from 'src/file/file.service';
import { CheckService } from 'src/check/check.service';
import { PromptService } from 'src/prompt/prompt.service';
import { NotificationService } from 'src/notification/notification.service';
import { ReportStrategy } from './providers/report-strategy.provider';
import { Logger } from '@nestjs/common';

describe('ReportsService', () => {
  let service: ReportsService;
  let notificationService: { checkStarted: jest.Mock; reportsChecked: jest.Mock; checkFailed: jest.Mock };
  let fileService: { parseStudentsFromFile: jest.Mock };
  let checkService: { getLabChecks: jest.Mock; getByIds: jest.Mock };
  let reportStrategy: { getStrategy: jest.Mock };

  beforeEach(async () => {
    notificationService = {
      checkStarted: jest.fn(),
      reportsChecked: jest.fn(),
      checkFailed: jest.fn(),
    };
    fileService = { parseStudentsFromFile: jest.fn() };
    checkService = { getLabChecks: jest.fn(), getByIds: jest.fn() };
    reportStrategy = { getStrategy: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: FileService, useValue: fileService },
        { provide: CheckService, useValue: checkService },
        { provide: PromptService, useValue: {} },
        { provide: NotificationService, useValue: notificationService },
        { provide: ReportStrategy, useValue: reportStrategy },
      ],
    }).compile();

    service = module.get(ReportsService);
  });

  // ─── parseStudentsFile ───────────────────────────────────────
  describe('parseStudentsFile', () => {
    it('delegates to fileService.parseStudentsFromFile with zip buffer', () => {
      const zipFile = { buffer: Buffer.from('zip data') } as Express.Multer.File;
      fileService.parseStudentsFromFile.mockReturnValue({ students: [] });

      const result = service.parseStudentsFile(zipFile);

      expect(fileService.parseStudentsFromFile).toHaveBeenCalledWith(zipFile.buffer);
      expect(result).toEqual({ students: [] });
    });
  });

  // ─── getLabChecks ────────────────────────────────────────────
  describe('getLabChecks', () => {
    it('delegates to checkService.getLabChecks', async () => {
      const checks = [{ id: 1 }, { id: 2 }];
      checkService.getLabChecks.mockResolvedValue(checks);

      const result = await service.getLabChecks(5);

      expect(checkService.getLabChecks).toHaveBeenCalledWith(5);
      expect(result).toEqual(checks);
    });
  });

  // ─── getChecks ───────────────────────────────────────────────
  describe('getChecks', () => {
    it('delegates to checkService.getByIds', async () => {
      const checks = [{ id: 1 }];
      checkService.getByIds.mockResolvedValue(checks);

      const result = await service.getChecks({ ids: [1, 2] });

      expect(checkService.getByIds).toHaveBeenCalledWith([1, 2]);
      expect(result).toEqual(checks);
    });
  });

  // ─── handleCheckReports ──────────────────────────────────────
  describe('handleCheckReports', () => {
    // We need to intercept setImmediate to test the async flow
    let originalSetImmediate: typeof setImmediate;

    beforeAll(() => {
      originalSetImmediate = global.setImmediate;
    });

    afterAll(() => {
      global.setImmediate = originalSetImmediate;
    });

    it('calls setImmediate with the check function', () => {
      const setImmediateSpy = jest.spyOn(global, 'setImmediate').mockImplementation((fn: any) => {
        // Don't actually execute; we just verify it was called
        return {} as any;
      });

      service.handleCheckReports({
        modelsId: [1],
        studentsId: [10],
        labId: 5,
        groupId: 1,
      } as any);

      expect(setImmediateSpy).toHaveBeenCalled();

      setImmediateSpy.mockRestore();
    });

    it('executes the full check flow: starts notification, runs strategy, reports completion', (done) => {
      const checkResults = [{ id: 100 }, { id: 101 }];
      const mockStrategy = { check: jest.fn().mockResolvedValue(checkResults) };

      reportStrategy.getStrategy.mockReturnValue(mockStrategy);

      const setImmediateSpy = jest.spyOn(global, 'setImmediate').mockImplementation((fn: any) => {
        // Execute synchronously so we can verify
        fn();
        return {} as any;
      });

      const dto = {
        modelsId: [1],
        studentsId: [10],
        labId: 5,
        groupId: 1,
      } as any;

      service.handleCheckReports(dto);

      // Use process.nextTick to let microtasks run
      process.nextTick(() => {
        try {
          expect(notificationService.checkStarted).toHaveBeenCalled();
          expect(reportStrategy.getStrategy).toHaveBeenCalledWith(1);
          expect(mockStrategy.check).toHaveBeenCalledWith(dto);
          expect(notificationService.reportsChecked).toHaveBeenCalledWith([100, 101], 5);
          setImmediateSpy.mockRestore();
          done();
        } catch (e) {
          setImmediateSpy.mockRestore();
          done(e);
        }
      });
    });

    it('calls checkFailed notification when strategy throws', (done) => {
      const error = new Error('LLM connection failed');
      const mockStrategy = { check: jest.fn().mockRejectedValue(error) };

      reportStrategy.getStrategy.mockReturnValue(mockStrategy);

      const setImmediateSpy = jest.spyOn(global, 'setImmediate').mockImplementation((fn: any) => {
        fn();
        return {} as any;
      });

      service.handleCheckReports({
        modelsId: [1],
        studentsId: [10],
        labId: 7,
        groupId: 1,
      } as any);

      process.nextTick(() => {
        try {
          expect(notificationService.checkFailed).toHaveBeenCalledWith(7, 'LLM connection failed');
          expect(notificationService.reportsChecked).not.toHaveBeenCalled();
          setImmediateSpy.mockRestore();
          done();
        } catch (e) {
          setImmediateSpy.mockRestore();
          done(e);
        }
      });
    });

    it('handles non-Error throws (undefined message)', (done) => {
      const mockStrategy = { check: jest.fn().mockRejectedValue('string error') };

      reportStrategy.getStrategy.mockReturnValue(mockStrategy);

      const setImmediateSpy = jest.spyOn(global, 'setImmediate').mockImplementation((fn: any) => {
        fn();
        return {} as any;
      });

      service.handleCheckReports({
        modelsId: [1],
        studentsId: [10],
        labId: 9,
        groupId: 1,
      } as any);

      process.nextTick(() => {
        try {
          expect(notificationService.checkFailed).toHaveBeenCalledWith(9, undefined);
          setImmediateSpy.mockRestore();
          done();
        } catch (e) {
          setImmediateSpy.mockRestore();
          done(e);
        }
      });
    });

    it('selects OneModelStrategy when 1 modelId', (done) => {
      const mockStrategy = { check: jest.fn().mockResolvedValue([]) };
      reportStrategy.getStrategy.mockReturnValue(mockStrategy);

      // Execute setImmediate callback synchronously
      const setImmediateSpy = jest.spyOn(global, 'setImmediate').mockImplementation((fn: any) => {
        fn();
        return {} as any;
      });

      service.handleCheckReports({
        modelsId: [1],
        studentsId: [10],
        labId: 5,
        groupId: 1,
      } as any);

      process.nextTick(() => {
        try {
          expect(reportStrategy.getStrategy).toHaveBeenCalledWith(1);
          setImmediateSpy.mockRestore();
          done();
        } catch (e) {
          setImmediateSpy.mockRestore();
          done(e);
        }
      });
    });

    it('selects MultipleModelStrategy when 2+ modelIds', (done) => {
      const mockStrategy = { check: jest.fn().mockResolvedValue([]) };
      reportStrategy.getStrategy.mockReturnValue(mockStrategy);

      const setImmediateSpy = jest.spyOn(global, 'setImmediate').mockImplementation((fn: any) => {
        fn();
        return {} as any;
      });

      service.handleCheckReports({
        modelsId: [1, 2],
        studentsId: [10],
        labId: 5,
        groupId: 1,
      } as any);

      process.nextTick(() => {
        try {
          expect(reportStrategy.getStrategy).toHaveBeenCalledWith(2);
          setImmediateSpy.mockRestore();
          done();
        } catch (e) {
          setImmediateSpy.mockRestore();
          done(e);
        }
      });
    });
  });
});
