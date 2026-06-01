import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { ModelService } from './model.service';
import { ModelFabric } from './providers/model.fabric';
import { NotFoundException } from '@nestjs/common';
import { Model } from './entities/model.entity';
import { LlmInterfaces } from 'src/types/reports.types';

describe('ModelService', () => {
  let service: ModelService;
  let modelRepo: {
    find: jest.Mock;
    findOne: jest.Mock;
    remove: jest.Mock;
  };
  let modelFabric: { create: jest.Mock };

  const makeHandler = () => ({
    create: jest.fn((dto) => Promise.resolve({ id: 1, ...dto })),
    update: jest.fn((model, dto) => Promise.resolve({ ...model, ...dto })),
  });

  beforeEach(async () => {
    modelRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn((entity) => Promise.resolve(entity)),
    };
    modelFabric = { create: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModelService,
        {
          provide: DataSource,
          useValue: { getRepository: jest.fn().mockReturnValue(modelRepo) },
        },
        { provide: ModelFabric, useValue: modelFabric },
      ],
    }).compile();

    service = module.get(ModelService);
  });

  // ─── findByIds ───────────────────────────────────────────────
  describe('findByIds', () => {
    it('returns models with key and provider relations', async () => {
      const models = [
        { id: 1, key: {}, provider: {} },
        { id: 2, key: {}, provider: {} },
      ];
      modelRepo.find.mockResolvedValue(models);

      const result = await service.findByIds([1, 2]);

      expect(result).toEqual(models);
      expect(modelRepo.find).toHaveBeenCalledWith({
        where: { id: expect.anything() },
        relations: { key: true, provider: true },
      });
    });
  });

  // ─── findOne ─────────────────────────────────────────────────
  describe('findOne', () => {
    it('returns model with relations', async () => {
      const model = { id: 1, key: {}, provider: {} };
      modelRepo.findOne.mockResolvedValue(model);

      const result = await service.findOne(1);

      expect(result).toEqual(model);
    });

    it('throws NotFoundException when model not found', async () => {
      modelRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── findMany ────────────────────────────────────────────────
  describe('findMany', () => {
    it('returns all models with relations', async () => {
      const models = [{ id: 1 }];
      modelRepo.find.mockResolvedValue(models);

      const result = await service.findMany();

      expect(result).toEqual(models);
    });
  });

  // ─── create ──────────────────────────────────────────────────
  describe('create', () => {
    it('delegates to the fabric handler for the given interface', async () => {
      const handler = makeHandler();
      modelFabric.create.mockReturnValue(handler);
      const dto = { name: 'gpt-4', value: 'gpt-4', llmInterface: LlmInterfaces.OpenAi };

      const result = await service.create(dto);

      expect(modelFabric.create).toHaveBeenCalledWith(LlmInterfaces.OpenAi);
      expect(handler.create).toHaveBeenCalledWith(dto);
      expect(result.id).toBe(1);
    });
  });

  // ─── update ──────────────────────────────────────────────────
  describe('update', () => {
    it('finds model and delegates update to handler', async () => {
      const existing = { id: 1, name: 'old' } as Model;
      modelRepo.findOne.mockResolvedValue(existing);
      const handler = makeHandler();
      modelFabric.create.mockReturnValue(handler);
      const dto = { name: 'new', llmInterface: LlmInterfaces.Ollama };

      await service.update(1, dto);

      expect(modelRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { key: true, provider: true },
      });
      expect(modelFabric.create).toHaveBeenCalledWith(LlmInterfaces.Ollama);
      expect(handler.update).toHaveBeenCalledWith(existing, dto);
    });
  });

  // ─── delete ──────────────────────────────────────────────────
  describe('delete', () => {
    it('removes existing model', async () => {
      const model = { id: 1 } as Model;
      modelRepo.findOne.mockResolvedValue(model);

      await service.delete(1);

      expect(modelRepo.remove).toHaveBeenCalledWith(model);
    });

    it('throws NotFoundException when model not found', async () => {
      modelRepo.findOne.mockResolvedValue(null);

      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });
  });
});
