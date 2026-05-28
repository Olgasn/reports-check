import { Test, TestingModule } from '@nestjs/testing';
import { PromptService } from './prompt.service';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { CourseService } from 'src/course/course.service';

const TEMPLATE = `@PROMPT_TEXT
Задание: @LAB_TASK
Формат: <JSON>{}</JSON>
@SPLIT
Ответ студента: @STUDENT_ANSWER`;

const TEMPLATE_MULTIPLE = `@PROMPT_TEXT
Задание: @LAB_TASK
Анализ нескольких проверок.
@SPLIT
Ответ студента: @STUDENT_ANSWER
Результаты других моделей: @MODELS_CHECK_RESULT`;

const TEMPLATE_PREV = `@PROMPT
Предыдущая оценка: @PREV_GRADE
Предыдущий отзыв: @PREV_REVIEW
Достоинства: @PREV_ADVANTAGES
Недостатки: @PREV_DISADVANTAGES
Предыдущий отчет: @PREV_REPORT`;

function buildService(module: TestingModule): PromptService {
  return module.get(PromptService);
}

function makeModule(
  template = TEMPLATE,
  templateMultiple = TEMPLATE_MULTIPLE,
  templatePrev = TEMPLATE_PREV,
) {
  return Test.createTestingModule({
    providers: [
      PromptService,
      {
        provide: DataSource,
        useValue: { getRepository: jest.fn().mockReturnValue({}) },
      },
      {
        provide: CourseService,
        useValue: {},
      },
      {
        provide: ConfigService,
        useValue: {
          get: jest.fn().mockReturnValue({ template, templateMultiple, templatePrev }),
        },
      },
    ],
  }).compile();
}

describe('PromptService — preparePrompt', () => {
  let service: PromptService;

  beforeEach(async () => {
    service = buildService(await makeModule());
  });

  it('replaces all three placeholders', () => {
    const result = service.preparePrompt('студенческий ответ', 'задание', 'инструкция промпта');
    expect(result.system).toContain('инструкция промпта');
    expect(result.system).toContain('задание');
    expect(result.user).toContain('студенческий ответ');
  });

  it('returns system part before @SPLIT and user part after @SPLIT', () => {
    const result = service.preparePrompt('answer', 'task', 'content');
    expect(result.system).not.toContain('@SPLIT');
    expect(result.user).not.toContain('@SPLIT');
    expect(result.system).toContain('@LAB_TASK'.replace('@LAB_TASK', 'task'));
    expect(result.user).toContain('answer');
  });

  it('returns empty system when template has no @SPLIT marker', async () => {
    const noSplitTemplate = '@PROMPT_TEXT\nЗадание: @LAB_TASK\nОтвет: @STUDENT_ANSWER';
    const svc = buildService(await makeModule(noSplitTemplate));
    const result = svc.preparePrompt('a', 't', 'c');
    expect(result.system).toBe('');
    expect(result.user).toContain('a');
  });

  it('does not leave placeholder tokens in output', () => {
    const result = service.preparePrompt('answer', 'task', 'content');
    const full = result.system + result.user;
    expect(full).not.toContain('@PROMPT_TEXT');
    expect(full).not.toContain('@LAB_TASK');
    expect(full).not.toContain('@STUDENT_ANSWER');
  });
});

describe('PromptService — prepareMultiplePrompt', () => {
  let service: PromptService;

  beforeEach(async () => {
    service = buildService(await makeModule());
  });

  it('joins checks with ", " in user part', () => {
    const result = service.prepareMultiplePrompt({
      task: 'task',
      answer: 'answer',
      content: 'content',
      checks: ['review A', 'review B'],
    });
    expect(result.user).toContain('review A, review B');
  });

  it('puts student answer in user part', () => {
    const result = service.prepareMultiplePrompt({
      task: 'task',
      answer: 'my answer',
      content: 'content',
      checks: ['r1'],
    });
    expect(result.user).toContain('my answer');
    expect(result.system).not.toContain('my answer');
  });

  it('puts task and content in system part', () => {
    const result = service.prepareMultiplePrompt({
      task: 'лаб задание',
      answer: 'ответ',
      content: 'промпт',
      checks: [],
    });
    expect(result.system).toContain('лаб задание');
    expect(result.system).toContain('промпт');
  });
});

describe('PromptService — preparePrevPrompt', () => {
  let service: PromptService;

  beforeEach(async () => {
    service = buildService(await makeModule());
  });

  it('replaces all prev placeholders', () => {
    const result = service.preparePrevPrompt({
      promptTxt: 'base prompt',
      review: 'хорошая работа',
      grade: '8',
      advantages: 'ясность',
      disadvantages: 'нет выводов',
      report: 'текст отчета',
    });

    expect(result).toContain('base prompt');
    expect(result).toContain('хорошая работа');
    expect(result).toContain('8');
    expect(result).toContain('ясность');
    expect(result).toContain('нет выводов');
    expect(result).toContain('текст отчета');
  });

  it('does not leave placeholder tokens in output', () => {
    const result = service.preparePrevPrompt({
      promptTxt: 'p',
      review: 'r',
      grade: '5',
      advantages: 'a',
      disadvantages: 'd',
      report: 'rep',
    });

    ['@PROMPT', '@PREV_GRADE', '@PREV_REVIEW', '@PREV_ADVANTAGES', '@PREV_DISADVANTAGES', '@PREV_REPORT'].forEach(
      (token) => expect(result).not.toContain(token),
    );
  });
});
