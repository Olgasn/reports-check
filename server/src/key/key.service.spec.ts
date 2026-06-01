import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { KeyService } from './key.service';
import { NotFoundException } from '@nestjs/common';

describe('KeyService', () => {
  let service: KeyService;
  let keyRepo: {
    findOne: jest.Mock;
    find: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    keyRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn((dto) => ({ id: 99, ...dto })),
      save: jest.fn((entity) => Promise.resolve(entity)),
      remove: jest.fn((entity) => Promise.resolve(entity)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KeyService,
        {
          provide: DataSource,
          useValue: { getRepository: jest.fn().mockReturnValue(keyRepo) },
        },
      ],
    }).compile();

    service = module.get(KeyService);
  });

  // ─── findOne ─────────────────────────────────────────────────
  describe('findOne', () => {
    it('returns key by id', async () => {
      const key = { id: 1, value: 'sk-abc123' };
      keyRepo.findOne.mockResolvedValue(key);

      const result = await service.findOne(1);

      expect(result).toEqual(key);
    });

    it('throws NotFoundException when key not found', async () => {
      keyRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── findMany ────────────────────────────────────────────────
  describe('findMany', () => {
    it('returns all keys', async () => {
      const keys = [{ id: 1 }, { id: 2 }];
      keyRepo.find.mockResolvedValue(keys);

      const result = await service.findMany();

      expect(result).toEqual(keys);
    });
  });

  // ─── create ──────────────────────────────────────────────────
  describe('create', () => {
    it('creates and saves a new key', async () => {
      const dto = { name: 'My Key', value: 'sk-new-key' };
      keyRepo.save.mockResolvedValue({ id: 1, name: 'My Key', value: 'sk-new-key' });

      const result = await service.create(dto);

      expect(keyRepo.create).toHaveBeenCalledWith(dto);
      expect(result.id).toBe(1);
    });
  });

  // ─── update ──────────────────────────────────────────────────
  describe('update', () => {
    it('updates existing key', async () => {
      const existing = { id: 1, value: 'old-key' };
      keyRepo.findOne.mockResolvedValue(existing);
      keyRepo.save.mockResolvedValue({ id: 1, value: 'updated-key' });

      const result = await service.update(1, { value: 'updated-key' });

      expect(result.value).toBe('updated-key');
    });
  });

  // ─── delete ──────────────────────────────────────────────────
  describe('delete', () => {
    it('removes existing key', async () => {
      const key = { id: 1 };
      keyRepo.findOne.mockResolvedValue(key);

      await service.delete(1);

      expect(keyRepo.remove).toHaveBeenCalledWith(key);
    });
  });
});
