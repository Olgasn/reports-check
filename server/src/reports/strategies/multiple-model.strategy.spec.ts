import { Test, TestingModule } from '@nestjs/testing';
import { MultipleModelStrategy } from './multiple-model.strategy';
import { ReportCheck } from '../providers/report-check.provider';
import { LabService } from 'src/lab/lab.service';
import { ModelService } from 'src/model/model.service';
import { FileService } from 'src/file/file.service';
import { LlmService } from 'src/llm/llm.service';
import { PromptService } from 'src/prompt/prompt.service';
import { LlmInterfaces } from 'src/types/reports.types';
import { Model } from 'src/model/entities/model.entity';
import { Student } from 'src/student/entities/student.entity';
import { CheckResult } from 'src/types/reports.types';

const makeModel = (id: number, name: string): Model =>
  ({ id, name, value: name, llmInterface: LlmInterfaces.OpenAi, cacheControl: false } as Model);

const makeStudent = (): Student =>
  ({ id: 1, name: 'Анна', surname: 'Сидорова', middlename: 'Павловна' } as Student);

const makeCheckResult = (overrides: Partial<CheckResult> = {}): CheckResult => ({
  student: makeStudent(),
  grade: 8,
  review: 'хорошо',
  advantages: ['ясно', 'точно'],
  disadvantages: ['краткость'],
  model: makeModel(1, 'model-a'),
  answer: 'ответ студента',
  ...overrides,
});

describe('MultipleModelStrategy — prepareMultipleData', () => {
  let strategy: MultipleModelStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MultipleModelStrategy,
        { provide: ReportCheck, useValue: {} },
        { provide: LabService, useValue: {} },
        { provide: ModelService, useValue: {} },
        { provide: FileService, useValue: {} },
        { provide: LlmService, useValue: {} },
        { provide: PromptService, useValue: {} },
      ],
    }).compile();

    strategy = module.get(MultipleModelStrategy);
  });

  it('aggregates results from multiple fulfilled promises per student', () => {
    const student = makeStudent();
    const resultA: CheckResult[] = [makeCheckResult({ grade: 7, model: makeModel(1, 'a') })];
    const resultB: CheckResult[] = [makeCheckResult({ grade: 9, model: makeModel(2, 'b') })];

    const settled: PromiseSettledResult<CheckResult[]>[] = [
      { status: 'fulfilled', value: resultA },
      { status: 'fulfilled', value: resultB },
    ];

    const reviewData = strategy.prepareMultipleData(settled);

    expect(reviewData).toHaveLength(1);
    expect(reviewData[0].student).toEqual(student);
    expect(reviewData[0].result).toHaveLength(2);
    expect(reviewData[0].result[0]).toContain('Grade: 7');
    expect(reviewData[0].result[1]).toContain('Grade: 9');
  });

  it('skips rejected model results', () => {
    const resultA: CheckResult[] = [makeCheckResult({ grade: 6 })];

    const settled: PromiseSettledResult<CheckResult[]>[] = [
      { status: 'fulfilled', value: resultA },
      { status: 'rejected', reason: new Error('failed') },
    ];

    const reviewData = strategy.prepareMultipleData(settled);
    expect(reviewData).toHaveLength(1);
    expect(reviewData[0].result).toHaveLength(1);
  });

  it('preserves student answer from first result set', () => {
    const results: CheckResult[] = [makeCheckResult({ answer: 'конкретный ответ' })];

    const settled: PromiseSettledResult<CheckResult[]>[] = [
      { status: 'fulfilled', value: results },
    ];

    const reviewData = strategy.prepareMultipleData(settled);
    expect(reviewData[0].answer).toBe('конкретный ответ');
  });

  it('formats check string with Review, Grade, Advantages, Disadvantages', () => {
    const result: CheckResult[] = [
      makeCheckResult({ grade: 8, review: 'неплохо', advantages: ['чёткость'], disadvantages: ['нет примеров'] }),
    ];

    const settled: PromiseSettledResult<CheckResult[]>[] = [
      { status: 'fulfilled', value: result },
    ];

    const reviewData = strategy.prepareMultipleData(settled);
    const checkStr = reviewData[0].result[0];

    expect(checkStr).toContain('Review: неплохо');
    expect(checkStr).toContain('Grade: 8');
    expect(checkStr).toContain('Advantages: чёткость');
    expect(checkStr).toContain('Disadvantages: нет примеров');
  });
});

describe('MultipleModelStrategy — prepareCheckData excludes last model from checkers', () => {
  let strategy: MultipleModelStrategy;
  let modelService: { findByIds: jest.Mock; findOne: jest.Mock };
  let labService: { findOne: jest.Mock };
  let fileService: { parseArchive: jest.Mock };

  beforeEach(async () => {
    modelService = { findByIds: jest.fn(), findOne: jest.fn() };
    labService = { findOne: jest.fn() };
    fileService = { parseArchive: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MultipleModelStrategy,
        { provide: ReportCheck, useValue: {} },
        { provide: LabService, useValue: labService },
        { provide: ModelService, useValue: modelService },
        { provide: FileService, useValue: fileService },
        { provide: LlmService, useValue: {} },
        { provide: PromptService, useValue: {} },
      ],
    }).compile();

    strategy = module.get(MultipleModelStrategy);
  });

  it('calls findByIds with all model ids except the last', async () => {
    const lab = {
      id: 1,
      content: 'задание',
      course: { prompt: { content: 'промпт' } },
    };

    labService.findOne.mockResolvedValue(lab);
    modelService.findByIds.mockResolvedValue([makeModel(1, 'a'), makeModel(2, 'b')]);
    modelService.findOne.mockResolvedValue(makeModel(3, 'reviewer'));
    fileService.parseArchive.mockResolvedValue([]);

    await strategy.prepareCheckData({
      labId: 1,
      modelsId: [1, 2, 3],
      studentsId: [],
      reportsZip: { buffer: Buffer.from('') } as any,
      checkPrev: false,
      groupId: 1,
    } as any);

    expect(modelService.findByIds).toHaveBeenCalledWith([1, 2]);
    expect(modelService.findOne).toHaveBeenCalledWith(3);
  });

  it('calls findByIds with empty array when only one model provided', async () => {
    const lab = {
      id: 1,
      content: 'задание',
      course: { prompt: { content: 'промпт' } },
    };

    labService.findOne.mockResolvedValue(lab);
    modelService.findByIds.mockResolvedValue([]);
    modelService.findOne.mockResolvedValue(makeModel(1, 'reviewer'));
    fileService.parseArchive.mockResolvedValue([]);

    await strategy.prepareCheckData({
      labId: 1,
      modelsId: [1],
      studentsId: [],
      reportsZip: { buffer: Buffer.from('') } as any,
      checkPrev: false,
      groupId: 1,
    } as any);

    expect(modelService.findByIds).toHaveBeenCalledWith([]);
    expect(modelService.findOne).toHaveBeenCalledWith(1);
  });
});

describe('MultipleModelStrategy — combineCheckResult', () => {
  let strategy: MultipleModelStrategy;
  let llmService: { query: jest.Mock; extractData: jest.Mock };
  let promptService: { prepareMultiplePrompt: jest.Mock };
  let fileService: { writeFile: jest.Mock };

  beforeEach(async () => {
    llmService = { query: jest.fn(), extractData: jest.fn() };
    promptService = { prepareMultiplePrompt: jest.fn() };
    fileService = { writeFile: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MultipleModelStrategy,
        { provide: ReportCheck, useValue: {} },
        { provide: LabService, useValue: {} },
        { provide: ModelService, useValue: {} },
        { provide: FileService, useValue: fileService },
        { provide: LlmService, useValue: llmService },
        { provide: PromptService, useValue: promptService },
      ],
    }).compile();

    strategy = module.get(MultipleModelStrategy);
  });

  it('queries llm, writes log file, extracts result and returns CheckResult', async () => {
    const modelReview = makeModel(3, 'reviewer');
    const student = makeStudent();

    const splitPrompt = { system: 'sys', user: 'usr' };
    promptService.prepareMultiplePrompt.mockReturnValue(splitPrompt);
    llmService.query.mockResolvedValue('<JSON>{"grade":9,"review":"отлично","advantages":["a"],"disadvantages":[]}</JSON>');
    llmService.extractData.mockResolvedValue({
      grade: 9,
      review: 'отлично',
      advantages: ['a'],
      disadvantages: [],
    });

    const result = await strategy.combineCheckResult({
      modelReview,
      task: 'задание',
      content: 'промпт',
      data: { student, result: ['check1'], answer: 'ответ' },
    });

    expect(llmService.query).toHaveBeenCalledWith(splitPrompt, modelReview);
    expect(fileService.writeFile).toHaveBeenCalledWith(
      expect.objectContaining({ folder: 'models_logs' }),
    );
    expect(result.grade).toBe(9);
    expect(result.student).toBe(student);
    expect(result.model).toBe(modelReview);
  });
});
