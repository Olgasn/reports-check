import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { GroupService } from './group.service';
import { StudentService } from 'src/student/student.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('GroupService', () => {
  let service: GroupService;
  let groupRepo: {
    findOne: jest.Mock;
    find: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    remove: jest.Mock;
  };
  let studentService: { findOne: jest.Mock; searchStudents: jest.Mock };

  beforeEach(async () => {
    groupRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn((dto) => ({ id: 99, ...dto })),
      save: jest.fn((entity) => Promise.resolve(entity)),
      remove: jest.fn((entity) => Promise.resolve(entity)),
    };
    studentService = { findOne: jest.fn(), searchStudents: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupService,
        {
          provide: DataSource,
          useValue: { getRepository: jest.fn().mockReturnValue(groupRepo) },
        },
        { provide: StudentService, useValue: studentService },
      ],
    }).compile();

    service = module.get(GroupService);
  });

  // ─── findOne ─────────────────────────────────────────────────
  describe('findOne', () => {
    it('returns group by id', async () => {
      const group = { id: 1, name: 'Group A' };
      groupRepo.findOne.mockResolvedValue(group);

      const result = await service.findOne(1);

      expect(result).toEqual(group);
    });

    it('throws NotFoundException when group not found', async () => {
      groupRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── findMany ────────────────────────────────────────────────
  describe('findMany', () => {
    it('returns all groups', async () => {
      const groups = [{ id: 1 }, { id: 2 }];
      groupRepo.find.mockResolvedValue(groups);

      const result = await service.findMany();

      expect(result).toEqual(groups);
    });
  });

  // ─── create ──────────────────────────────────────────────────
  describe('create', () => {
    it('creates and saves a new group', async () => {
      const dto = { name: 'New Group' };
      groupRepo.save.mockResolvedValue({ id: 1, name: 'New Group' });

      const result = await service.create(dto);

      expect(groupRepo.create).toHaveBeenCalledWith(dto);
      expect(result.id).toBe(1);
    });
  });

  // ─── update ──────────────────────────────────────────────────
  describe('update', () => {
    it('updates existing group', async () => {
      const existing = { id: 1, name: 'Old' };
      groupRepo.findOne.mockResolvedValue(existing);
      groupRepo.save.mockResolvedValue({ id: 1, name: 'Updated' });

      const result = await service.update(1, { name: 'Updated' });

      expect(result.name).toBe('Updated');
    });
  });

  // ─── delete ──────────────────────────────────────────────────
  describe('delete', () => {
    it('removes existing group', async () => {
      const group = { id: 1 };
      groupRepo.findOne.mockResolvedValue(group);

      await service.delete(1);

      expect(groupRepo.remove).toHaveBeenCalledWith(group);
    });
  });

  // ─── isMember ────────────────────────────────────────────────
  describe('isMember', () => {
    it('returns true when student is a member', async () => {
      const group = { id: 1, students: [{ id: 10 }, { id: 20 }] };
      const student = { id: 10 };
      groupRepo.findOne.mockResolvedValue(group);
      studentService.findOne.mockResolvedValue(student);

      const result = await service.isMember({ studentId: 10, groupId: 1 });

      expect(result.isMember).toBe(true);
    });

    it('returns false when student is not a member', async () => {
      const group = { id: 1, students: [{ id: 10 }] };
      const student = { id: 99 };
      groupRepo.findOne.mockResolvedValue(group);
      studentService.findOne.mockResolvedValue(student);

      const result = await service.isMember({ studentId: 99, groupId: 1 });

      expect(result.isMember).toBe(false);
    });
  });

  // ─── addMember ───────────────────────────────────────────────
  describe('addMember', () => {
    it('adds student to group', async () => {
      const group = { id: 1, students: [{ id: 10 }] };
      const student = { id: 20 };
      groupRepo.findOne.mockResolvedValue(group);
      studentService.findOne.mockResolvedValue(student);

      await service.addMember({ studentId: 20, groupId: 1 });

      expect(groupRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ students: [{ id: 10 }, { id: 20 }] }),
      );
    });

    it('throws if student is already a member', async () => {
      const group = { id: 1, students: [{ id: 10 }] };
      const student = { id: 10 };
      groupRepo.findOne.mockResolvedValue(group);
      studentService.findOne.mockResolvedValue(student);

      await expect(service.addMember({ studentId: 10, groupId: 1 })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ─── removeMember ────────────────────────────────────────────
  describe('removeMember', () => {
    it('removes student from group', async () => {
      const group = { id: 1, students: [{ id: 10 }, { id: 20 }] };
      const student = { id: 10 };
      groupRepo.findOne.mockResolvedValue(group);
      studentService.findOne.mockResolvedValue(student);

      await service.removeMember({ studentId: 10, groupId: 1 });

      expect(groupRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ students: [{ id: 20 }] }),
      );
    });

    it('throws if student is not a member', async () => {
      const group = { id: 1, students: [{ id: 10 }] };
      const student = { id: 99 };
      groupRepo.findOne.mockResolvedValue(group);
      studentService.findOne.mockResolvedValue(student);

      await expect(service.removeMember({ studentId: 99, groupId: 1 })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ─── getGroupStudents ────────────────────────────────────────
  describe('getGroupStudents', () => {
    it('verifies group exists and delegates to studentService.searchStudents', async () => {
      groupRepo.findOne.mockResolvedValue({ id: 1 });
      studentService.searchStudents.mockResolvedValue({ items: [], count: 0 });

      await service.getGroupStudents({
        groupId: 1,
        page: 1,
        pageSize: 10,
        offset: 0,
        search: '',
      } as any);

      expect(studentService.searchStudents).toHaveBeenCalled();
    });

    it('throws NotFoundException when group not found', async () => {
      groupRepo.findOne.mockResolvedValue(null);

      await expect(
        service.getGroupStudents({
          groupId: 999,
          page: 1,
          pageSize: 10,
          offset: 0,
          search: '',
        } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
