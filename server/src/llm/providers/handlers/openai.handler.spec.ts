import { OpenAiHandler } from './openai.handler';
import { LlmInterfaces } from 'src/types/reports.types';
import { Model } from 'src/model/entities/model.entity';
import OpenAI from 'openai';

// Keep the real APIError so instanceof checks work; mock only the default constructor.
jest.mock('openai', () => {
  const actual = jest.requireActual<typeof import('openai')>('openai');
  const MockCtor = jest.fn().mockImplementation(() => ({
    chat: { completions: { create: jest.fn() } },
  })) as any;
  MockCtor.APIError = actual.default.APIError;
  return { ...actual, default: MockCtor, __esModule: true };
});

const MockOpenAI = OpenAI as jest.MockedClass<typeof OpenAI>;

const makeModel = (overrides: Partial<Model> = {}): Model =>
  ({
    id: 1,
    name: 'claude-3-5-sonnet',
    value: 'anthropic/claude-3.5-sonnet',
    llmInterface: LlmInterfaces.OpenAi,
    top_p: 1,
    temperature: 1,
    max_tokens: 2048,
    cacheControl: false,
    provider: { id: 1, name: 'OpenRouter', url: 'https://openrouter.ai/api/v1' },
    key: { id: 1, name: 'my-key', value: 'sk-test-key' },
    ...overrides,
  } as Model);

describe('OpenAiHandler — completion', () => {
  let handler: OpenAiHandler;
  let mockCreate: jest.Mock;

  beforeEach(() => {
    handler = new OpenAiHandler();
    mockCreate = jest.fn();

    MockOpenAI.mockImplementation(
      () =>
        ({
          chat: {
            completions: {
              create: mockCreate,
            },
          },
        } as any),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('sends user message and returns content', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: 'model response' } }],
    });

    const result = await handler.completion({ system: '', user: 'user message' }, makeModel());

    expect(result).toBe('model response');
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'user', content: 'user message' }),
        ]),
      }),
    );
  });

  it('includes system message when system is non-empty', async () => {
    mockCreate.mockResolvedValue({ choices: [{ message: { content: 'ok' } }] });

    await handler.completion({ system: 'system msg', user: 'user msg' }, makeModel());

    const call = mockCreate.mock.calls[0][0];
    const systemMsg = call.messages.find((m: any) => m.role === 'system');
    expect(systemMsg).toBeDefined();
    expect(systemMsg.content).toBe('system msg');
  });

  it('omits system message when system is empty string', async () => {
    mockCreate.mockResolvedValue({ choices: [{ message: { content: 'ok' } }] });

    await handler.completion({ system: '', user: 'user msg' }, makeModel());

    const call = mockCreate.mock.calls[0][0];
    const systemMsg = call.messages.find((m: any) => m.role === 'system');
    expect(systemMsg).toBeUndefined();
  });

  it('adds cache_control to system message when cacheControl is true', async () => {
    mockCreate.mockResolvedValue({ choices: [{ message: { content: 'ok' } }] });

    await handler.completion(
      { system: 'cacheable system', user: 'user msg' },
      makeModel({ cacheControl: true }),
    );

    const call = mockCreate.mock.calls[0][0];
    const systemMsg = call.messages.find((m: any) => m.role === 'system');
    expect(Array.isArray(systemMsg.content)).toBe(true);
    expect(systemMsg.content[0]).toMatchObject({
      type: 'text',
      text: 'cacheable system',
      cache_control: { type: 'ephemeral' },
    });
  });

  it('does NOT add cache_control when cacheControl is false', async () => {
    mockCreate.mockResolvedValue({ choices: [{ message: { content: 'ok' } }] });

    await handler.completion(
      { system: 'system msg', user: 'user msg' },
      makeModel({ cacheControl: false }),
    );

    const call = mockCreate.mock.calls[0][0];
    const systemMsg = call.messages.find((m: any) => m.role === 'system');
    expect(typeof systemMsg.content).toBe('string');
  });

  it('passes model parameters correctly', async () => {
    mockCreate.mockResolvedValue({ choices: [{ message: { content: 'ok' } }] });

    const model = makeModel({ top_p: 0.9, temperature: 0.5, max_tokens: 512 });
    await handler.completion({ system: '', user: 'u' }, model);

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        top_p: 0.9,
        temperature: 0.5,
        max_tokens: 512,
        model: model.value,
      }),
    );
  });

  it('throws when provider or key is missing', async () => {
    await expect(
      handler.completion({ system: '', user: 'u' }, makeModel({ provider: null, key: null })),
    ).rejects.toThrow('No provider or key specified');
  });

  it('throws when API returns empty content', async () => {
    mockCreate.mockResolvedValue({ choices: [{ message: { content: null } }] });

    await expect(handler.completion({ system: '', user: 'u' }, makeModel())).rejects.toThrow(
      'empty response',
    );
  });
});

describe('OpenAiHandler — processError', () => {
  let handler: OpenAiHandler;

  beforeEach(() => {
    handler = new OpenAiHandler();
  });

  it('does nothing for non-OpenAI errors', () => {
    expect(() => handler.processError(new Error('generic'))).not.toThrow();
  });

  it('throws for OpenAI APIError with status 400', () => {
    const apiError = new OpenAI.APIError(400, { message: 'bad request' }, 'bad request', {} as any);
    expect(() => handler.processError(apiError)).toThrow('bad request');
  });

  it('does not throw for OpenAI APIError with status 429 (rate limit)', () => {
    const apiError = new OpenAI.APIError(429, { message: 'rate limit' }, 'rate limit', {} as any);
    expect(() => handler.processError(apiError)).not.toThrow();
  });
});
