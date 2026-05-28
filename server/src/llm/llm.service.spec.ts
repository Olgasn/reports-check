import { Test, TestingModule } from '@nestjs/testing';
import { LlmService } from './llm.service';
import { LlmProviderFactory } from './providers/llm-provider.factory';
import { CheckResultDto } from 'src/reports/dto/check-result.dto';
import { LlmInterfaces } from 'src/types/reports.types';
import { Model } from 'src/model/entities/model.entity';

jest.mock('src/common/helpers/wait.helper', () => ({
  wait: jest.fn().mockResolvedValue(undefined),
}));

const makeModel = (overrides: Partial<Model> = {}): Model =>
  ({
    id: 1,
    name: 'test-model',
    value: 'gpt-4',
    maxRetries: 3,
    queryDelay: 0,
    errorDelay: 0,
    top_p: 1,
    temperature: 1,
    max_tokens: 1024,
    llmInterface: LlmInterfaces.OpenAi,
    cacheControl: false,
    ...overrides,
  } as Model);

describe('LlmService — pure helpers', () => {
  let service: LlmService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LlmService,
        { provide: LlmProviderFactory, useValue: { create: jest.fn() } },
      ],
    }).compile();

    service = module.get(LlmService);
  });

  // ──────────────────────────────────────────────────
  // normalizeJsonBlock
  // ──────────────────────────────────────────────────
  describe('normalizeJsonBlock', () => {
    it('strips ```json ... ``` fence', () => {
      const input = '```json\n{"a":1}\n```';
      expect(service.normalizeJsonBlock(input)).toBe('{"a":1}');
    });

    it('strips plain ``` fence', () => {
      expect(service.normalizeJsonBlock('```\n{"a":1}\n```')).toBe('{"a":1}');
    });

    it('returns unchanged string without fence', () => {
      expect(service.normalizeJsonBlock('{"a":1}')).toBe('{"a":1}');
    });
  });

  // ──────────────────────────────────────────────────
  // removeTrailingCommas
  // ──────────────────────────────────────────────────
  describe('removeTrailingCommas', () => {
    it('removes trailing comma before }', () => {
      expect(service.removeTrailingCommas('{"a":1,}')).toBe('{"a":1}');
    });

    it('removes trailing comma before ]', () => {
      expect(service.removeTrailingCommas('[1,2,]')).toBe('[1,2]');
    });

    it('does not affect valid JSON', () => {
      expect(service.removeTrailingCommas('{"a":1,"b":2}')).toBe('{"a":1,"b":2}');
    });
  });

  // ──────────────────────────────────────────────────
  // escapeControlCharsInStrings
  // ──────────────────────────────────────────────────
  describe('escapeControlCharsInStrings', () => {
    it('escapes newline inside a JSON string', () => {
      const raw = '{"review":"line1\nline2"}';
      const result = service.escapeControlCharsInStrings(raw);
      expect(result).toBe('{"review":"line1\\nline2"}');
    });

    it('escapes carriage return inside a JSON string', () => {
      const raw = '{"review":"a\rb"}';
      expect(service.escapeControlCharsInStrings(raw)).toBe('{"review":"a\\rb"}');
    });

    it('escapes tab inside a JSON string', () => {
      const raw = '{"review":"a\tb"}';
      expect(service.escapeControlCharsInStrings(raw)).toBe('{"review":"a\\tb"}');
    });

    it('does not escape newline outside strings (e.g. between keys)', () => {
      const raw = '{\n"a":1\n}';
      expect(service.escapeControlCharsInStrings(raw)).toBe('{\n"a":1\n}');
    });

    it('handles escaped backslash inside string correctly', () => {
      const raw = '{"path":"C:\\\\Users"}';
      expect(service.escapeControlCharsInStrings(raw)).toBe('{"path":"C:\\\\Users"}');
    });
  });

  // ──────────────────────────────────────────────────
  // parseModelJson
  // ──────────────────────────────────────────────────
  describe('parseModelJson', () => {
    it('parses valid JSON on first attempt', () => {
      expect(service.parseModelJson('{"grade":8}')).toEqual({ grade: 8 });
    });

    it('parses JSON with control characters using sanitized fallback', () => {
      const raw = '{"review":"line1\nline2","grade":7}';
      const result = service.parseModelJson(raw);
      expect(result.grade).toBe(7);
    });

    it('parses JSON with trailing comma using second fallback', () => {
      const raw = '{"grade":5,}';
      const result = service.parseModelJson(raw);
      expect(result.grade).toBe(5);
    });

    it('throws on truly unparseable JSON', () => {
      expect(() => service.parseModelJson('not json at all {{{{')).toThrow('Failed to parse JSON');
    });
  });

  // ──────────────────────────────────────────────────
  // extractData
  // ──────────────────────────────────────────────────
  describe('extractData', () => {
    it('extracts and validates a valid CheckResultDto', async () => {
      const json = {
        grade: 8,
        review: 'Good work',
        advantages: ['clear'],
        disadvantages: [],
      };
      const content = `<JSON>${JSON.stringify(json)}</JSON>`;

      const result = await service.extractData(CheckResultDto, content);

      expect(result.grade).toBe(8);
      expect(result.review).toBe('Good work');
      expect(result.advantages).toEqual(['clear']);
    });

    it('throws when <JSON> block is absent', async () => {
      await expect(service.extractData(CheckResultDto, 'no block here')).rejects.toThrow(
        'JSON block not found',
      );
    });

    it('throws on validation failure (grade missing)', async () => {
      const bad = `<JSON>{"review":"x","advantages":["y"],"disadvantages":[]}</JSON>`;
      await expect(service.extractData(CheckResultDto, bad)).rejects.toThrow('Validation error');
    });

    it('extracts JSON with markdown fences inside tags', async () => {
      const json = { grade: 6, review: 'ok', advantages: ['a'], disadvantages: [] };
      const content = `<JSON>\`\`\`json\n${JSON.stringify(json)}\n\`\`\`</JSON>`;

      const result = await service.extractData(CheckResultDto, content);
      expect(result.grade).toBe(6);
    });
  });
});

// ──────────────────────────────────────────────────
// query — retry logic
// ──────────────────────────────────────────────────
describe('LlmService — query (retry)', () => {
  let service: LlmService;
  let mockCompletion: jest.Mock;
  let mockProcessError: jest.Mock;

  beforeEach(async () => {
    mockCompletion = jest.fn();
    mockProcessError = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LlmService,
        {
          provide: LlmProviderFactory,
          useValue: {
            create: jest.fn().mockReturnValue({
              completion: mockCompletion,
              processError: mockProcessError,
            }),
          },
        },
      ],
    }).compile();

    service = module.get(LlmService);
  });

  it('returns result on first successful call', async () => {
    mockCompletion.mockResolvedValueOnce('response text');
    const model = makeModel({ maxRetries: 3 });
    const result = await service.query({ system: 'sys', user: 'usr' }, model);
    expect(result).toBe('response text');
    expect(mockCompletion).toHaveBeenCalledTimes(1);
  });

  it('retries on empty response and returns next non-empty result', async () => {
    mockCompletion.mockResolvedValueOnce('').mockResolvedValueOnce('second try');
    const model = makeModel({ maxRetries: 3 });
    const result = await service.query({ system: '', user: 'usr' }, model);
    expect(result).toBe('second try');
    expect(mockCompletion).toHaveBeenCalledTimes(2);
  });

  it('retries on thrown error and returns result on second attempt', async () => {
    mockCompletion
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValueOnce('recovered');
    const model = makeModel({ maxRetries: 3 });
    const result = await service.query({ system: '', user: 'usr' }, model);
    expect(result).toBe('recovered');
    expect(mockProcessError).toHaveBeenCalledTimes(1);
  });

  it('throws after all retries exhausted', async () => {
    mockCompletion.mockResolvedValue('');
    const model = makeModel({ maxRetries: 2 });
    await expect(service.query({ system: '', user: 'usr' }, model)).rejects.toThrow(
      'Не получилось выполнить проверку.',
    );
    expect(mockCompletion).toHaveBeenCalledTimes(2);
  });
});
