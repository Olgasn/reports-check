import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { CourseService } from './course.service';
import { NotFoundException } from '@nestjs/common';

describe('CourseService', () => {
  let service: CourseService;
  let courseRepo: {
    findOne: jest.Mock;
    find: jest.Mock;
    findAndCount: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    courseRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn((dto) => ({ id: 99, ...dto })),
      save: jest.fn((entity) => Promise.resolve(entity)),
      remove: jest.fn((entity) => Promise.resolve(entity)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseService,
        {
          provide: DataSource,
          useValue: { getRepository: jest.fn().mockReturnValue(courseRepo) },
        },
      ],
    }).compile();

    service = module.get(CourseService);
  });

  // ─── findOne ─────────────────────────────────────────────────
  describe('findOne', () => {
    it('returns course with default prompt relation', async () => {
      const course = { id: 1, name: 'Course 1', prompt: { id: 10 } };
      courseRepo.findOne.mockResolvedValue(course);

      const result = await service.findOne(1);

      expect(courseRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { prompt: true },
      });
      expect(result).toEqual(course);
    });

    it('throws NotFoundException when course does not exist', async () => {
      courseRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── findMany (search) ───────────────────────────────────────
  describe('findMany', () => {
    it('searches by name with pagination', async () => {
      courseRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.findMany({ page: 1, pageSize: 10, offset: 0, name: 'math' } as any);

      expect(courseRepo.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: { name: expect.objectContaining({}) },
      });
    });
  });

  // ─── findAllCourses ──────────────────────────────────────────
  describe('findAllCourses', () => {
    it('returns all courses with only id and name selected', async () => {
      const courses = [{ id: 1, name: 'A' }, { id: 2, name: 'B' }];
      courseRepo.find.mockResolvedValue(courses);

      const result = await service.findAllCourses();

      expect(courseRepo.find).toHaveBeenCalledWith({
        select: { id: true, name: true },
      });
      expect(result).toEqual(courses);
    });
  });

  // ─── findWithLabs ────────────────────────────────────────────
  describe('findWithLabs', () => {
    it('returns courses with labs relation', async () => {
      const courses = [{ id: 1, labs: [] }];
      courseRepo.find.mockResolvedValue(courses);

      const result = await service.findWithLabs();

      expect(courseRepo.find).toHaveBeenCalledWith({
        relations: { labs: true },
      });
      expect(result).toEqual(courses);
    });
  });

  // ─── create ──────────────────────────────────────────────────
  describe('create', () => {
    it('creates and saves a new course', async () => {
      const dto = { name: 'New Course', description: 'A test course' };
      courseRepo.save.mockResolvedValue({ id: 1, name: 'New Course', description: 'A test course' });

      const result = await service.create(dto);

      expect(courseRepo.create).toHaveBeenCalledWith(dto);
      expect(result.id).toBe(1);
    });
  });

  // ─── update ──────────────────────────────────────────────────
  describe('update', () => {
    it('updates existing course fields', async () => {
      const existing = { id: 1, name: 'Old' };
      courseRepo.findOne.mockResolvedValue(existing);
      courseRepo.save.mockResolvedValue({ id: 1, name: 'Updated' });

      const result = await service.update(1, { name: 'Updated' });

      expect(result.name).toBe('Updated');
    });

    it('throws NotFoundException when course not found', async () => {
      courseRepo.findOne.mockResolvedValue(null);

      await expect(service.update(999, { name: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  // ─── delete ──────────────────────────────────────────────────
  describe('delete', () => {
    it('removes existing course', async () => {
      const course = { id: 1 };
      courseRepo.findOne.mockResolvedValue(course);

      await service.delete(1);

      expect(courseRepo.remove).toHaveBeenCalledWith(course);
    });

    it('throws NotFoundException when course not found', async () => {
      courseRepo.findOne.mockResolvedValue(null);

      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── getLabs ─────────────────────────────────────────────────
  describe('getLabs', () => {
    it('returns labs for a given course', async () => {
      const course = { id: 1, labs: [{ id: 10 }, { id: 11 }] };
      courseRepo.findOne.mockResolvedValue(course);

      const result = await service.getLabs(1);

      expect(courseRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { labs: true },
      });
      expect(result).toEqual(course.labs);
    });

    it('throws NotFoundException when course not found', async () => {
      courseRepo.findOne.mockResolvedValue(null);

      await expect(service.getLabs(999)).rejects.toThrow(NotFoundException);
    });
  });
});
