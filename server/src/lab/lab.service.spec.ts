import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { LabService } from './lab.service';
import { CourseService } from 'src/course/course.service';
import { FileService } from 'src/file/file.service';
import { NotFoundException } from '@nestjs/common';

describe('LabService', () => {
  let service: LabService;
  let labRepo: {
    findOne: jest.Mock;
    find: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    remove: jest.Mock;
  };
  let courseService: { findOne: jest.Mock };
  let fileService: { parseFile: jest.Mock };

  beforeEach(async () => {
    labRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn((dto) => ({ id: 99, ...dto })),
      save: jest.fn((entity) => Promise.resolve(entity)),
      remove: jest.fn((entity) => Promise.resolve(entity)),
    };
    courseService = { findOne: jest.fn() };
    fileService = { parseFile: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LabService,
        {
          provide: DataSource,
          useValue: { getRepository: jest.fn().mockReturnValue(labRepo) },
        },
        { provide: CourseService, useValue: courseService },
        { provide: FileService, useValue: fileService },
      ],
    }).compile();

    service = module.get(LabService);
  });

  // ─── findOne ─────────────────────────────────────────────────
  describe('findOne', () => {
    it('returns lab by id', async () => {
      const lab = { id: 1, name: 'Lab 1' };
      labRepo.findOne.mockResolvedValue(lab);

      const result = await service.findOne(1);

      expect(result).toEqual(lab);
    });

    it('throws NotFoundException when lab not found', async () => {
      labRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── findMany ────────────────────────────────────────────────
  describe('findMany', () => {
    it('returns all labs', async () => {
      const labs = [{ id: 1 }, { id: 2 }];
      labRepo.find.mockResolvedValue(labs);

      const result = await service.findMany();

      expect(result).toEqual(labs);
    });
  });

  // ─── prepareFile ─────────────────────────────────────────────
  describe('prepareFile', () => {
    it('parses file and returns filename, filesize, and content', async () => {
      const file = {
        originalname: 'task.pdf',
        buffer: Buffer.from('pdf content'),
      } as Express.Multer.File;
      fileService.parseFile.mockResolvedValue('parsed task text');

      const result = await service.prepareFile(file);

      expect(fileService.parseFile).toHaveBeenCalledWith('task.pdf', file.buffer);
      expect(result).toEqual({
        filename: 'task.pdf',
        filesize: 16,
        content: 'parsed task text',
      });
    });

    it('decodes latin1-encoded filenames', async () => {
      // Russian filenames in multipart forms often come as latin1-encoded
      const originalname = Buffer.from('задание.pdf', 'utf-8').toString('latin1');
      const file = {
        originalname,
        buffer: Buffer.from('content'),
      } as Express.Multer.File;
      fileService.parseFile.mockResolvedValue('parsed');

      const result = await service.prepareFile(file);

      expect(result.filename).toBe('задание.pdf');
    });
  });

  // ─── create ──────────────────────────────────────────────────
  describe('create', () => {
    it('creates lab with parsed file and course relation', async () => {
      const taskFile = {
        originalname: 'task.pdf',
        buffer: Buffer.from('pdf data'),
      } as Express.Multer.File;
      const course = { id: 5, name: 'Course' };
      const dto = {
        name: 'Lab 1',
        description: 'Desc',
        courseId: 5,
        task: taskFile,
      };

      courseService.findOne.mockResolvedValue(course);
      fileService.parseFile.mockResolvedValue('file content parsed');
      labRepo.save.mockResolvedValue({ id: 1, ...dto, course });

      const result = await service.create(dto);

      expect(courseService.findOne).toHaveBeenCalledWith(5);
      expect(fileService.parseFile).toHaveBeenCalled();
      expect(labRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Lab 1',
          course,
          content: 'file content parsed',
        }),
      );
      expect(result.id).toBe(1);
    });
  });

  // ─── update ──────────────────────────────────────────────────
  describe('update', () => {
    it('updates lab fields without changing file', async () => {
      const existing = { id: 1, name: 'Old', description: 'Old desc' };
      labRepo.findOne.mockResolvedValue(existing);
      labRepo.save.mockResolvedValue({ ...existing, name: 'Updated' });

      const result = await service.update(1, {
        name: 'Updated',
        description: 'New desc',
      });

      expect(result.name).toBe('Updated');
    });

    it('updates course when courseId provided', async () => {
      const existing = { id: 1 };
      const course = { id: 10 };
      labRepo.findOne.mockResolvedValue(existing);
      courseService.findOne.mockResolvedValue(course);
      labRepo.save.mockResolvedValue({ ...existing, course });

      const result = await service.update(1, {
        name: 'Lab', description: 'D', courseId: 10,
      });

      expect(courseService.findOne).toHaveBeenCalledWith(10);
      expect(result.course).toEqual(course);
    });

    it('re-parses file when task is provided', async () => {
      const existing = { id: 1 };
      const taskFile = {
        originalname: 'new_task.pdf',
        buffer: Buffer.from('new content'),
      } as Express.Multer.File;
      labRepo.findOne.mockResolvedValue(existing);
      fileService.parseFile.mockResolvedValue('new parsed');

      await service.update(1, {
        name: 'Lab', description: 'D', task: taskFile,
      });

      expect(fileService.parseFile).toHaveBeenCalledWith('new_task.pdf', taskFile.buffer);
    });
  });

  // ─── delete ──────────────────────────────────────────────────
  describe('delete', () => {
    it('removes existing lab', async () => {
      const lab = { id: 1 };
      labRepo.findOne.mockResolvedValue(lab);

      await service.delete(1);

      expect(labRepo.remove).toHaveBeenCalledWith(lab);
    });

    it('throws NotFoundException when lab not found', async () => {
      labRepo.findOne.mockResolvedValue(null);

      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });
  });
});
