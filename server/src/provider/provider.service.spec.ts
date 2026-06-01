import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { ProviderService } from './provider.service';
import { NotFoundException } from '@nestjs/common';

describe('ProviderService', () => {
  let service: ProviderService;
  let providerRepo: {
    findOne: jest.Mock;
    find: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    providerRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn((dto) => ({ id: 99, ...dto })),
      save: jest.fn((entity) => Promise.resolve(entity)),
      remove: jest.fn((entity) => Promise.resolve(entity)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProviderService,
        {
          provide: DataSource,
          useValue: { getRepository: jest.fn().mockReturnValue(providerRepo) },
        },
      ],
    }).compile();

    service = module.get(ProviderService);
  });

  // ─── findOne ─────────────────────────────────────────────────
  describe('findOne', () => {
    it('returns provider by id', async () => {
      const provider = { id: 1, name: 'OpenAI', url: 'https://api.openai.com' };
      providerRepo.findOne.mockResolvedValue(provider);

      const result = await service.findOne(1);

      expect(result).toEqual(provider);
    });

    it('throws NotFoundException when provider not found', async () => {
      providerRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── findMany ────────────────────────────────────────────────
  describe('findMany', () => {
    it('returns all providers', async () => {
      const providers = [{ id: 1 }, { id: 2 }];
      providerRepo.find.mockResolvedValue(providers);

      const result = await service.findMany();

      expect(result).toEqual(providers);
    });
  });

  // ─── create ──────────────────────────────────────────────────
  describe('create', () => {
    it('creates and saves a new provider', async () => {
      const dto = { name: 'Custom Provider', url: 'https://custom.api' };
      providerRepo.save.mockResolvedValue({ id: 1, ...dto });

      const result = await service.create(dto);

      expect(providerRepo.create).toHaveBeenCalledWith(dto);
      expect(result.id).toBe(1);
    });
  });

  // ─── update ──────────────────────────────────────────────────
  describe('update', () => {
    it('updates existing provider', async () => {
      const existing = { id: 1, name: 'Old', url: 'https://old.url' };
      providerRepo.findOne.mockResolvedValue(existing);
      providerRepo.save.mockResolvedValue({ id: 1, name: 'Updated', url: 'https://new.url' });

      const result = await service.update(1, { name: 'Updated', url: 'https://new.url' });

      expect(result.name).toBe('Updated');
    });
  });

  // ─── delete ──────────────────────────────────────────────────
  describe('delete', () => {
    it('removes existing provider', async () => {
      const provider = { id: 1 };
      providerRepo.findOne.mockResolvedValue(provider);

      await service.delete(1);

      expect(providerRepo.remove).toHaveBeenCalledWith(provider);
    });
  });
});
