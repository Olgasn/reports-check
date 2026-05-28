import { Test, TestingModule } from '@nestjs/testing';
import { ReportCheck } from './report-check.provider';
import { NotificationService } from 'src/notification/notification.service';
import { PromptService } from 'src/prompt/prompt.service';
import { FileService } from 'src/file/file.service';
import { LlmService } from 'src/llm/llm.service';
import { CheckService } from 'src/check/check.service';
import { StudentService } from 'src/student/student.service';
import { CheckResultDto } from '../dto/check-result.dto';
import { LlmInterfaces } from 'src/types/reports.types';
import { Model } from 'src/model/entities/model.entity';
import { Student } from 'src/student/entities/student.entity';
import { Check } from 'src/check/entities/check.entity';

const makeModel = (overrides: Partial<Model> = {}): Model =>
  ({ id: 1, name: 'gpt-4', value: 'gpt-4', llmInterface: LlmInterfaces.OpenAi, ...overrides } as Model);

const makeStudent = (overrides: Partial<Student> = {}): Student =>
  ({ id: 10, name: 'Иван', surname: 'Иванов', middlename: 'Иванович', ...overrides } as Student);

const makeReport = () => ({
  name: 'Иван',
  surname: 'Иванов',
  middlename: 'Иванович',
  num: '1',
  content: 'текст отчета',
});

const makeCheckResult = (overrides = {}) => ({
  student: makeStudent(),
  grade: 7,
  review: 'хорошо',
  advantages: ['понятно', 'структурировано'],
  disadvantages: ['нет выводов'],
  model: makeModel(),
  answer: 'текст',
  ...overrides,
});

describe('ReportCheck — filterSuccessResults', () => {
  let provider: ReportCheck;
  let notificationService: jest.Mocked<NotificationService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportCheck,
        { provide: NotificationService, useValue: { reportOneStarted: jest.fn(), reportOneChecked: jest.fn(), reportOneFailed: jest.fn() } },
        { provide: PromptService, useValue: {} },
        { provide: FileService, useValue: { writeFile: jest.fn() } },
        { provide: LlmService, useValue: {} },
        { provide: CheckService, useValue: {} },
        { provide: StudentService, useValue: {} },
      ],
    }).compile();

    provider = module.get(ReportCheck);
    notificationService = module.get(NotificationService) as jest.Mocked<NotificationService>;
  });

  it('returns only fulfilled results', () => {
    const promises: PromiseSettledResult<any>[] = [
      { status: 'fulfilled', value: makeCheckResult() },
      { status: 'rejected', reason: new Error('fail') },
    ];

    const results = provider.filterSuccessResults({
      resultPromises: promises,
      reportsData: [makeReport()],
      modelName: 'gpt-4',
      labId: 1,
    });

    expect(results).toHaveLength(1);
    expect(results[0].grade).toBe(7);
  });

  it('throws when all results are rejected', () => {
    const err = new Error('all failed');
    const promises: PromiseSettledResult<any>[] = [{ status: 'rejected', reason: err }];

    expect(() =>
      provider.filterSuccessResults({
        resultPromises: promises,
        reportsData: [],
        modelName: 'model',
        labId: 1,
      }),
    ).toThrow();
  });

  it('emits reportOneFailed for students not in reportsData', () => {
    const unknownStudent = makeStudent({ name: 'Петр', surname: 'Петров', middlename: 'Петрович' });
    const promises: PromiseSettledResult<any>[] = [
      { status: 'fulfilled', value: makeCheckResult({ student: unknownStudent }) },
    ];

    provider.filterSuccessResults({
      resultPromises: promises,
      reportsData: [makeReport()],
      modelName: 'gpt-4',
      labId: 1,
    });

    expect(notificationService.reportOneFailed).toHaveBeenCalledWith(
      expect.objectContaining({ student: 'Петр Петров Петрович' }),
    );
  });
});

describe('ReportCheck — processStudent', () => {
  let provider: ReportCheck;
  let studentService: { findRawStudent: jest.Mock; create: jest.Mock };

  beforeEach(async () => {
    studentService = { findRawStudent: jest.fn(), create: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportCheck,
        { provide: NotificationService, useValue: { reportOneStarted: jest.fn(), reportOneChecked: jest.fn(), reportOneFailed: jest.fn() } },
        { provide: PromptService, useValue: {} },
        { provide: FileService, useValue: {} },
        { provide: LlmService, useValue: {} },
        { provide: CheckService, useValue: {} },
        { provide: StudentService, useValue: studentService },
      ],
    }).compile();

    provider = module.get(ReportCheck);
  });

  it('returns existing student without creating new one', async () => {
    const existing = makeStudent();
    studentService.findRawStudent.mockResolvedValue(existing);

    const result = await provider.processStudent({
      name: 'Иван', surname: 'Иванов', middlename: 'Иванович', groupId: 1,
    });

    expect(result.student).toBe(existing);
    expect(result.studentFound).toBe(existing);
    expect(studentService.create).not.toHaveBeenCalled();
  });

  it('creates student when not found', async () => {
    const created = makeStudent({ id: 99 });
    studentService.findRawStudent.mockResolvedValue(null);
    studentService.create.mockResolvedValue(created);

    const result = await provider.processStudent({
      name: 'Иван', surname: 'Иванов', middlename: 'Иванович', groupId: 2,
    });

    expect(result.student.id).toBe(99);
    expect(studentService.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Иван', groupId: 2 }),
    );
  });

  it('builds studentStr as "name surname middlename"', async () => {
    studentService.findRawStudent.mockResolvedValue(makeStudent());

    const result = await provider.processStudent({
      name: 'Иван', surname: 'Иванов', middlename: 'Иванович', groupId: 1,
    });

    expect(result.studentStr).toBe('Иван Иванов Иванович');
  });
});

describe('ReportCheck — preparePrompt', () => {
  let provider: ReportCheck;
  let checkService: { findLastCheck: jest.Mock };
  let promptService: { preparePrevPrompt: jest.Mock };

  beforeEach(async () => {
    checkService = { findLastCheck: jest.fn() };
    promptService = { preparePrevPrompt: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportCheck,
        { provide: NotificationService, useValue: {} },
        { provide: PromptService, useValue: promptService },
        { provide: FileService, useValue: {} },
        { provide: LlmService, useValue: {} },
        { provide: CheckService, useValue: checkService },
        { provide: StudentService, useValue: {} },
      ],
    }).compile();

    provider = module.get(ReportCheck);
  });

  it('returns prompt unchanged when usePrev is false', async () => {
    const prompt = { system: 'sys', user: 'usr' };
    const result = await provider.preparePrompt(prompt, false, 1);
    expect(result).toEqual(prompt);
    expect(checkService.findLastCheck).not.toHaveBeenCalled();
  });

  it('returns prompt unchanged when stId is undefined', async () => {
    const prompt = { system: 'sys', user: 'usr' };
    const result = await provider.preparePrompt(prompt, true, undefined);
    expect(result).toEqual(prompt);
  });

  it('returns prompt unchanged when no previous check found', async () => {
    checkService.findLastCheck.mockResolvedValue(null);
    const prompt = { system: 'sys', user: 'usr' };
    const result = await provider.preparePrompt(prompt, true, 42);
    expect(result).toEqual(prompt);
  });

  it('builds prev prompt from system+user when both present', async () => {
    const prevCheck = {
      review: 'prev review', grade: 7, advantages: 'adv', disadvantages: 'dis', report: 'rep',
    };
    checkService.findLastCheck.mockResolvedValue(prevCheck);
    promptService.preparePrevPrompt.mockReturnValue('prev prompt text');

    const prompt = { system: 'SYSTEM', user: 'USER' };
    const result = await provider.preparePrompt(prompt, true, 42);

    expect(promptService.preparePrevPrompt).toHaveBeenCalledWith(
      expect.objectContaining({ promptTxt: 'SYSTEM\nUSER', grade: '7' }),
    );
    expect(result).toEqual({ system: '', user: 'prev prompt text' });
  });

  it('builds prev prompt from user only when system is empty', async () => {
    const prevCheck = {
      review: 'r', grade: 5, advantages: 'a', disadvantages: 'd', report: 'rep',
    };
    checkService.findLastCheck.mockResolvedValue(prevCheck);
    promptService.preparePrevPrompt.mockReturnValue('result');

    await provider.preparePrompt({ system: '', user: 'ONLY_USER' }, true, 5);

    expect(promptService.preparePrevPrompt).toHaveBeenCalledWith(
      expect.objectContaining({ promptTxt: 'ONLY_USER' }),
    );
  });
});

describe('ReportCheck — createChecks', () => {
  let provider: ReportCheck;
  let checkService: { create: jest.Mock };

  beforeEach(async () => {
    checkService = { create: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportCheck,
        { provide: NotificationService, useValue: {} },
        { provide: PromptService, useValue: {} },
        { provide: FileService, useValue: {} },
        { provide: LlmService, useValue: {} },
        { provide: CheckService, useValue: checkService },
        { provide: StudentService, useValue: {} },
      ],
    }).compile();

    provider = module.get(ReportCheck);
  });

  it('creates one Check per result and returns them', async () => {
    const savedCheck = { id: 1 } as Check;
    checkService.create.mockResolvedValue(savedCheck);

    const results = [
      makeCheckResult({ advantages: ['a', 'b'], disadvantages: ['c'] }),
      makeCheckResult({ grade: 9, student: makeStudent({ id: 11 }) }),
    ];

    const checks = await provider.createChecks(results, 1, 5);

    expect(checkService.create).toHaveBeenCalledTimes(2);
    expect(checks).toHaveLength(2);
    expect(checkService.create).toHaveBeenCalledWith(
      expect.objectContaining({ labId: 5, modelId: 1, advantages: 'a\nb' }),
    );
  });

  it('joins advantages and disadvantages with newline', async () => {
    checkService.create.mockResolvedValue({} as Check);

    await provider.createChecks(
      [makeCheckResult({ advantages: ['x', 'y'], disadvantages: ['z', 'w'] })],
      1,
      1,
    );

    expect(checkService.create).toHaveBeenCalledWith(
      expect.objectContaining({ advantages: 'x\ny', disadvantages: 'z\nw' }),
    );
  });
});
