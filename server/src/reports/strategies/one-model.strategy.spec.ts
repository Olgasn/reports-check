import { Test, TestingModule } from '@nestjs/testing';
import { OneModelStrategy } from './one-model.strategy';
import { ReportCheck } from '../providers/report-check.provider';
import { LabService } from 'src/lab/lab.service';
import { ModelService } from 'src/model/model.service';
import { FileService } from 'src/file/file.service';
import { LlmInterfaces } from 'src/types/reports.types';
import { Model } from 'src/model/entities/model.entity';
import { Student } from 'src/student/entities/student.entity';
import { Check } from 'src/check/entities/check.entity';
import { CheckResult } from 'src/types/reports.types';

const makeModel = (): Model =>
  ({ id: 1, name: 'gpt-4', value: 'gpt-4', llmInterface: LlmInterfaces.OpenAi }) as Model;

const makeStudent = (): Student =>
  ({ id: 1, name: 'Мария', surname: 'Кузнецова', middlename: 'Сергеевна' }) as Student;

const makeCheckResult = (): CheckResult => ({
  student: makeStudent(),
  grade: 8,
  review: 'хорошо',
  advantages: ['ясность'],
  disadvantages: [],
  model: makeModel(),
  answer: 'ответ',
  promptInjectionDetected: false,
  promptInjectionRisk: 'none',
  promptInjectionFragments: [],
  securityComment: '',
});

const makeReportData = () => ({
  name: 'Мария',
  surname: 'Кузнецова',
  middlename: 'Сергеевна',
  num: '1',
  content: 'текст',
});

describe('OneModelStrategy — prepareCheckData', () => {
  let strategy: OneModelStrategy;
  let labService: { findOne: jest.Mock };
  let modelService: { findOne: jest.Mock };
  let fileService: { parseArchive: jest.Mock; parseSingleReport: jest.Mock };

  beforeEach(async () => {
    labService = { findOne: jest.fn() };
    modelService = { findOne: jest.fn() };
    fileService = { parseArchive: jest.fn(), parseSingleReport: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OneModelStrategy,
        { provide: ReportCheck, useValue: {} },
        { provide: LabService, useValue: labService },
        { provide: ModelService, useValue: modelService },
        { provide: FileService, useValue: fileService },
      ],
    }).compile();

    strategy = module.get(OneModelStrategy);
  });

  it('loads lab and model by ids from dto', async () => {
    const lab = { id: 2, content: 'задание', course: { prompt: { content: 'промпт' } } };
    const model = makeModel();

    labService.findOne.mockResolvedValue(lab);
    modelService.findOne.mockResolvedValue(model);
    fileService.parseArchive.mockResolvedValue([makeReportData()]);

    const data = await strategy.prepareCheckData({
      labId: 2,
      modelsId: [1],
      studentsId: [],
      reportsZip: { buffer: Buffer.from('') } as any,
      checkPrev: false,
      groupId: 1,
    } as any);

    expect(labService.findOne).toHaveBeenCalledWith(2, expect.any(Object));
    expect(modelService.findOne).toHaveBeenCalledWith(1);
    expect(data.model).toBe(model);
    expect(data.content).toBe('промпт');
    expect(data.task).toBe('задание');
  });

  it('filters reportsData by studentsId when provided', async () => {
    const lab = { id: 1, content: 'task', course: { prompt: { content: 'c' } } };
    labService.findOne.mockResolvedValue(lab);
    modelService.findOne.mockResolvedValue(makeModel());

    const report1 = makeReportData();
    const report2 = {
      ...makeReportData(),
      name: 'Петр',
      surname: 'Петров',
      middlename: 'Петрович',
    };
    fileService.parseArchive.mockResolvedValue([report1, report2]);

    const data = await strategy.prepareCheckData({
      labId: 1,
      modelsId: [1],
      studentsId: [{ name: 'Мария', surname: 'Кузнецова', middlename: 'Сергеевна' }],
      reportsZip: { buffer: Buffer.from('') } as any,
      checkPrev: false,
      groupId: 1,
    } as any);

    expect(data.reportsData).toHaveLength(1);
    expect(data.reportsData[0].name).toBe('Мария');
  });

  it('returns all reports when studentsId is empty', async () => {
    const lab = { id: 1, content: 'task', course: { prompt: { content: 'c' } } };
    labService.findOne.mockResolvedValue(lab);
    modelService.findOne.mockResolvedValue(makeModel());
    fileService.parseArchive.mockResolvedValue([makeReportData(), makeReportData()]);

    const data = await strategy.prepareCheckData({
      labId: 1,
      modelsId: [1],
      studentsId: [],
      reportsZip: { buffer: Buffer.from('') } as any,
      checkPrev: false,
      groupId: 1,
    } as any);

    expect(data.reportsData).toHaveLength(2);
  });

  it('throws when no file provided', async () => {
    const lab = { id: 1, content: 'task', course: { prompt: { content: 'c' } } };
    labService.findOne.mockResolvedValue(lab);
    modelService.findOne.mockResolvedValue(makeModel());

    await expect(
      strategy.prepareCheckData({
        labId: 1,
        modelsId: [1],
        studentsId: [],
        checkPrev: false,
        groupId: 1,
      } as any),
    ).rejects.toThrow('Не переданы файлы отчета');
  });
});

describe('OneModelStrategy — check (orchestration)', () => {
  let strategy: OneModelStrategy;
  let reportCheck: {
    checkOneReport: jest.Mock;
    filterSuccessResults: jest.Mock;
    createChecks: jest.Mock;
  };
  let labService: { findOne: jest.Mock };
  let modelService: { findOne: jest.Mock };
  let fileService: { parseArchive: jest.Mock };

  beforeEach(async () => {
    reportCheck = {
      checkOneReport: jest.fn(),
      filterSuccessResults: jest.fn(),
      createChecks: jest.fn(),
    };
    labService = { findOne: jest.fn() };
    modelService = { findOne: jest.fn() };
    fileService = { parseArchive: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OneModelStrategy,
        { provide: ReportCheck, useValue: reportCheck },
        { provide: LabService, useValue: labService },
        { provide: ModelService, useValue: modelService },
        { provide: FileService, useValue: fileService },
      ],
    }).compile();

    strategy = module.get(OneModelStrategy);
  });

  it('calls checkOneReport for each report and returns created checks', async () => {
    const lab = { id: 1, content: 'task', course: { prompt: { content: 'c' } } };
    const model = makeModel();
    const reports = [makeReportData(), makeReportData()];
    const savedChecks = [{ id: 1 } as Check, { id: 2 } as Check];
    const results = [makeCheckResult(), makeCheckResult()];

    labService.findOne.mockResolvedValue(lab);
    modelService.findOne.mockResolvedValue(model);
    fileService.parseArchive.mockResolvedValue(reports);
    reportCheck.checkOneReport.mockResolvedValue(makeCheckResult());
    reportCheck.filterSuccessResults.mockReturnValue(results);
    reportCheck.createChecks.mockResolvedValue(savedChecks);

    const checks = await strategy.check({
      labId: 1,
      modelsId: [1],
      studentsId: [],
      reportsZip: { buffer: Buffer.from('') } as any,
      checkPrev: false,
      groupId: 1,
    } as any);

    expect(reportCheck.checkOneReport).toHaveBeenCalledTimes(2);
    expect(reportCheck.filterSuccessResults).toHaveBeenCalledTimes(1);
    expect(reportCheck.createChecks).toHaveBeenCalledWith(results, model.id, lab.id);
    expect(checks).toBe(savedChecks);
  });
});
