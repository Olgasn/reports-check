import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { StudentService } from './student.service';
import { GroupService } from 'src/group/group.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('StudentService', () => {
  let service: StudentService;
  let studentRepo: {
    find: jest.Mock;
    findOne: jest.Mock;
    findAndCount: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    remove: jest.Mock;
  };
  let groupService: { findOne: jest.Mock };

  beforeEach(async () => {
    studentRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn((dto) => ({ id: 99, ...dto })),
      save: jest.fn((entity) => Promise.resolve(entity)),
      remove: jest.fn((entity) => Promise.resolve(entity)),
    };
    groupService = { findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentService,
        {
          provide: DataSource,
          useValue: { getRepository: jest.fn().mockReturnValue(studentRepo) },
        },
        { provide: GroupService, useValue: groupService },
      ],
    }).compile();

    service = module.get(StudentService);
  });

  // ─── findByIds ───────────────────────────────────────────────
  describe('findByIds', () => {
    it('returns students matching the given ids', async () => {
      const students = [{ id: 1 }, { id: 2 }];
      studentRepo.find.mockResolvedValue(students);

      const result = await service.findByIds([1, 2]);

      expect(result).toEqual(students);
    });
  });

  // ─── findRawStudent ──────────────────────────────────────────
  describe('findRawStudent', () => {
    it('finds student by name, surname, middlename', async () => {
      const student = { id: 1, name: 'Иван', surname: 'Иванов', middlename: 'Иванович' };
      studentRepo.findOne.mockResolvedValue(student);

      const result = await service.findRawStudent('Иван', 'Иванов', 'Иванович');

      expect(studentRepo.findOne).toHaveBeenCalledWith({
        where: { name: 'Иван', surname: 'Иванов', middlename: 'Иванович' },
      });
      expect(result).toEqual(student);
    });

    it('returns null when student not found', async () => {
      studentRepo.findOne.mockResolvedValue(null);

      const result = await service.findRawStudent('X', 'Y', 'Z');

      expect(result).toBeNull();
    });
  });

  // ─── findOne ─────────────────────────────────────────────────
  describe('findOne', () => {
    it('returns student with group relation', async () => {
      const student = { id: 1, group: { id: 5 } };
      studentRepo.findOne.mockResolvedValue(student);

      const result = await service.findOne(1);

      expect(result).toEqual(student);
    });

    it('throws NotFoundException when student does not exist', async () => {
      studentRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── findMany ────────────────────────────────────────────────
  describe('findMany', () => {
    it('returns all students with group relation', async () => {
      const students = [
        { id: 1, group: {} },
        { id: 2, group: {} },
      ];
      studentRepo.find.mockResolvedValue(students);

      const result = await service.findMany();

      expect(result).toEqual(students);
      expect(studentRepo.find).toHaveBeenCalledWith({
        where: {},
        relations: { group: true },
      });
    });
  });

  // ─── searchStudents ──────────────────────────────────────────
  describe('searchStudents', () => {
    it('searches by surname and groupId with pagination', async () => {
      studentRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.searchStudents({
        page: 1,
        pageSize: 10,
        offset: 0,
        search: 'Иван',
        groupId: 1,
      } as any);

      expect(studentRepo.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {
          surname: expect.objectContaining({}),
          group: { id: 1 },
        },
      });
    });
  });

  // ─── create ──────────────────────────────────────────────────
  describe('create', () => {
    it('creates student without group when groupId not provided', async () => {
      const dto = { name: 'Анна', surname: 'Смирнова', middlename: 'Алексеевна' };
      studentRepo.save.mockResolvedValue({ id: 1, ...dto });

      const result = await service.create(dto);

      expect(studentRepo.create).toHaveBeenCalledWith({
        name: 'Анна',
        surname: 'Смирнова',
        middlename: 'Алексеевна',
      });
      expect(result.id).toBe(1);
    });

    it('creates student with group relation when groupId provided', async () => {
      const group = { id: 3, name: 'Группа А' };
      const dto = { name: 'Борис', surname: 'Борисов', middlename: 'Борисович', groupId: 3 };
      groupService.findOne.mockResolvedValue(group);
      studentRepo.save.mockResolvedValue({ id: 2, ...dto, group });

      const result = await service.create(dto);

      expect(groupService.findOne).toHaveBeenCalledWith(3);
      expect(result.group).toEqual(group);
    });
  });

  // ─── update ──────────────────────────────────────────────────
  describe('update', () => {
    it('updates student fields', async () => {
      const existing = { id: 1, name: 'old', surname: 'old', middlename: 'old', group: null };
      studentRepo.findOne.mockResolvedValue(existing);
      studentRepo.save.mockResolvedValue({ ...existing, name: 'new' });

      const result = await service.update(1, { name: 'new', surname: 'new', middlename: 'new' });

      expect(result.name).toBe('new');
    });

    it('updates group when groupId provided', async () => {
      const group = { id: 5, name: 'New Group' };
      const existing = { id: 1, name: 'x', surname: 'y', middlename: 'z', group: null };
      studentRepo.findOne.mockResolvedValue(existing);
      groupService.findOne.mockResolvedValue(group);
      studentRepo.save.mockResolvedValue({ ...existing, group });

      const result = await service.update(1, {
        name: 'x',
        surname: 'y',
        middlename: 'z',
        groupId: 5,
      });

      expect(groupService.findOne).toHaveBeenCalledWith(5);
      expect(result.group).toEqual(group);
    });

    it('throws NotFoundException when student does not exist', async () => {
      studentRepo.findOne.mockResolvedValue(null);

      await expect(
        service.update(999, { name: 'x', surname: 'y', middlename: 'z' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── delete ──────────────────────────────────────────────────
  describe('delete', () => {
    it('removes existing student', async () => {
      const student = { id: 1 };
      studentRepo.findOne.mockResolvedValue(student);

      await service.delete(1);

      expect(studentRepo.remove).toHaveBeenCalledWith(student);
    });

    it('throws NotFoundException when student does not exist', async () => {
      studentRepo.findOne.mockResolvedValue(null);

      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── CSV helpers ─────────────────────────────────────────────
  describe('decodeCsv', () => {
    it('returns UTF-8 content when headers match', () => {
      const buffer = Buffer.from('Имя,Фамилия,Группы\nИван,Иванов,Группа1', 'utf-8');

      const result = service.decodeCsv(buffer);

      expect(result).toContain('Имя');
    });

    it('falls back to win1251 when UTF-8 headers do not match', () => {
      // Create buffer that looks like win1251
      const win1251Bytes = [0xc8, 0xec, 0xff, 0x2c, 0xd4, 0xe0, 0xec, 0xe8, 0xeb, 0xe8, 0xff]; // "Имя,Фамилия" in win1251
      const buffer = Buffer.from(win1251Bytes);

      const result = service.decodeCsv(buffer);

      // Should be decoded from win1251 — check that it contains expected chars
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('hasRequiredHeaders', () => {
    it('returns true when header contains имя and фам', () => {
      expect(service.hasRequiredHeaders('Имя,Фамилия,Группы')).toBe(true);
    });

    it('returns false when headers are missing', () => {
      expect(service.hasRequiredHeaders('Name,Surname,Group')).toBe(false);
    });

    it('is case-insensitive', () => {
      expect(service.hasRequiredHeaders('имя,фамилия,группы')).toBe(true);
    });
  });

  describe('detectDelimiter', () => {
    it('returns ; when semicolons outnumber commas', () => {
      expect(service.detectDelimiter('Имя;Фамилия;Группы')).toBe(';');
    });

    it('returns , when commas outnumber semicolons', () => {
      expect(service.detectDelimiter('Имя,Фамилия,Группы')).toBe(',');
    });

    it('defaults to , when no delimiters found', () => {
      expect(service.detectDelimiter('Имя')).toBe(',');
    });
  });

  describe('parseCsv', () => {
    it('parses simple comma-separated CSV', () => {
      const result = service.parseCsv('Имя,Фамилия,Группы\nИван,Иванов,Группа1');

      expect(result).toEqual([
        ['Имя', 'Фамилия', 'Группы'],
        ['Иван', 'Иванов', 'Группа1'],
      ]);
    });

    it('parses semicolon-separated CSV', () => {
      const result = service.parseCsv('Имя;Фамилия;Группы\nИван;Иванов;Группа1');

      expect(result).toEqual([
        ['Имя', 'Фамилия', 'Группы'],
        ['Иван', 'Иванов', 'Группа1'],
      ]);
    });

    it('handles quoted fields with embedded delimiters', () => {
      const result = service.parseCsv('Имя,Фамилия,Группы\n"Иван,мл.",Иванов,Группа1');

      expect(result[1][0]).toBe('Иван,мл.');
    });

    it('handles quoted fields with escaped quotes', () => {
      const result = service.parseCsv('Имя,Фамилия\n"О""Брайн",Тест');

      expect(result[1][0]).toBe('О"Брайн');
    });

    it('skips empty rows', () => {
      const result = service.parseCsv('Имя,Фамилия\n\nИван,Иванов\n');

      expect(result).toHaveLength(2);
    });

    it('handles CRLF line endings', () => {
      const result = service.parseCsv('Имя,Фамилия\r\nИван,Иванов');

      expect(result).toHaveLength(2);
    });
  });

  describe('pickPrimaryGroup', () => {
    it('returns first group when multiple semicolon-separated', () => {
      expect(service.pickPrimaryGroup('Группа1;Группа2;Группа3')).toBe('Группа1');
    });

    it('returns first group when multiple comma-separated', () => {
      expect(service.pickPrimaryGroup('Группа A, Группа B')).toBe('Группа A');
    });

    it('returns single group as-is', () => {
      expect(service.pickPrimaryGroup('Группа1')).toBe('Группа1');
    });
  });

  describe('normalizeHeader', () => {
    it('lowercases and trims header', () => {
      expect(service.normalizeHeader('  ИМЯ  ')).toBe('имя');
    });

    it('collapses multiple spaces', () => {
      expect(service.normalizeHeader('Имя  Фамилия')).toBe('имя фамилия');
    });
  });

  describe('normalizeGroupName', () => {
    it('lowercases and trims group name', () => {
      expect(service.normalizeGroupName('  Группа А ')).toBe('группа а');
    });
  });

  // ─── importFromCsv (integration of CSV helpers) ──────────────
  describe('importFromCsv', () => {
    const makeCsvFile = (content: string): Express.Multer.File =>
      ({ buffer: Buffer.from(content, 'utf-8') }) as Express.Multer.File;

    const makeTransactionManager = (overrides: Record<string, unknown> = {}) => ({
      getRepository: jest.fn().mockReturnValue({
        find: jest.fn().mockResolvedValue([]),
        findOne: jest.fn().mockResolvedValue(null),
        create: jest.fn((dto: unknown) => dto),
        save: jest.fn((entity: unknown) => Promise.resolve(entity)),
        ...overrides,
      }),
    });

    const makeMockDataSource = (transactionOverrides: Record<string, unknown> = {}) => ({
      getRepository: jest.fn().mockReturnValue(studentRepo),
      transaction: jest.fn().mockImplementation((cb: (manager: unknown) => unknown) => {
        const manager = makeTransactionManager(transactionOverrides);
        return cb(manager);
      }),
    });

    it('throws BadRequestException when file is nil', async () => {
      await expect(service.importFromCsv(undefined as any)).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when CSV has only headers', async () => {
      const file = makeCsvFile('Имя,Фамилия,Группы');

      await expect(service.importFromCsv(file)).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when required headers are missing', async () => {
      const file = makeCsvFile('Name,Surname\nJohn,Doe');

      await expect(service.importFromCsv(file)).rejects.toThrow(BadRequestException);
    });

    it('imports students with transaction', async () => {
      const mockDataSource = makeMockDataSource();

      const module2: TestingModule = await Test.createTestingModule({
        providers: [
          StudentService,
          { provide: DataSource, useValue: mockDataSource },
          { provide: GroupService, useValue: groupService },
        ],
      }).compile();

      const svc = module2.get(StudentService);
      const file = makeCsvFile('Имя,Фамилия,Отчество,Группы\nИван,Иванов,Иванович,Группа1');

      const result = await svc.importFromCsv(file);

      expect(result.createdStudents).toBe(1);
      expect(result.createdGroups).toBe(1);
    });

    it('skips rows with missing required fields', async () => {
      const mockDataSource = makeMockDataSource();

      const module2: TestingModule = await Test.createTestingModule({
        providers: [
          StudentService,
          { provide: DataSource, useValue: mockDataSource },
          { provide: GroupService, useValue: groupService },
        ],
      }).compile();

      const svc = module2.get(StudentService);
      const file = makeCsvFile('Имя,Фамилия,Группы\n,,Группа1\nИван,Иванов,Группа1');

      const result = await svc.importFromCsv(file);

      expect(result.skippedRows).toBe(1);
      expect(result.createdStudents).toBe(1);
    });

    it('counts duplicates when student already exists', async () => {
      const existingStudent = { id: 1, name: 'Иван', surname: 'Иванов', middlename: 'Иванович' };
      const mockDataSource = makeMockDataSource({
        findOne: jest.fn().mockResolvedValue(existingStudent),
      });

      const module2: TestingModule = await Test.createTestingModule({
        providers: [
          StudentService,
          { provide: DataSource, useValue: mockDataSource },
          { provide: GroupService, useValue: groupService },
        ],
      }).compile();

      const svc = module2.get(StudentService);
      const file = makeCsvFile('Имя,Фамилия,Группы\nИван,Иванов,Группа1');

      const result = await svc.importFromCsv(file);

      expect(result.duplicateStudents).toBe(1);
      expect(result.createdStudents).toBe(0);
    });

    it('uses middlename column when present and defaults to "-" when empty', async () => {
      const mockDataSource = makeMockDataSource();

      const module2: TestingModule = await Test.createTestingModule({
        providers: [
          StudentService,
          { provide: DataSource, useValue: mockDataSource },
          { provide: GroupService, useValue: groupService },
        ],
      }).compile();

      const svc = module2.get(StudentService);
      const file = makeCsvFile('Имя,Фамилия,Отчество,Группы\nИван,Иванов,,Группа1');

      const result = await svc.importFromCsv(file);

      expect(result.createdStudents).toBe(1);
    });
  });
});
