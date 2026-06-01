import { Test, TestingModule } from '@nestjs/testing';
import { ModuleRef } from '@nestjs/core';
import { ReportStrategy } from './report-strategy.provider';
import { OneModelStrategy } from '../strategies/one-model.strategy';
import { MultipleModelStrategy } from '../strategies/multiple-model.strategy';

describe('ReportStrategy', () => {
  let provider: ReportStrategy;
  let moduleRef: { get: jest.Mock };
  let oneModelStrategy: Partial<OneModelStrategy>;
  let multipleModelStrategy: Partial<MultipleModelStrategy>;

  beforeEach(async () => {
    oneModelStrategy = { check: jest.fn() };
    multipleModelStrategy = { check: jest.fn() };

    moduleRef = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ReportStrategy, { provide: ModuleRef, useValue: moduleRef }],
    }).compile();

    provider = module.get(ReportStrategy);
  });

  describe('getStrategy', () => {
    it('returns OneModelStrategy when modelsAmount is 1', () => {
      moduleRef.get.mockReturnValue(oneModelStrategy);

      const result = provider.getStrategy(1);

      expect(moduleRef.get).toHaveBeenCalledWith(OneModelStrategy);
      expect(result).toBe(oneModelStrategy);
    });

    it('returns OneModelStrategy when modelsAmount is 0', () => {
      moduleRef.get.mockReturnValue(oneModelStrategy);

      const result = provider.getStrategy(0);

      expect(moduleRef.get).toHaveBeenCalledWith(OneModelStrategy);
      expect(result).toBe(oneModelStrategy);
    });

    it('returns MultipleModelStrategy when modelsAmount is 2', () => {
      moduleRef.get.mockReturnValue(multipleModelStrategy);

      const result = provider.getStrategy(2);

      expect(moduleRef.get).toHaveBeenCalledWith(MultipleModelStrategy);
      expect(result).toBe(multipleModelStrategy);
    });

    it('returns MultipleModelStrategy when modelsAmount is more than 2', () => {
      moduleRef.get.mockReturnValue(multipleModelStrategy);

      const result = provider.getStrategy(5);

      expect(moduleRef.get).toHaveBeenCalledWith(MultipleModelStrategy);
      expect(result).toBe(multipleModelStrategy);
    });
  });
});
