import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { CheckService } from './check.service';
import { StudentService } from 'src/student/student.service';
import { ModelService } from 'src/model/model.service';
import { LabService } from 'src/lab/lab.service';

describe('CheckService - create', () => {
  let service: CheckService;
  let repo: { create: jest.Mock; save: jest.Mock };
  let studentService: { findOne: jest.Mock };
  let modelService: { findOne: jest.Mock };
  let labService: { findOne: jest.Mock };

  beforeEach(async () => {
    repo = {
      create: jest.fn((value) => ({ id: 99, ...value })),
      save: jest.fn((value) => Promise.resolve(value)),
    };
    studentService = { findOne: jest.fn() };
    modelService = { findOne: jest.fn() };
    labService = { findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckService,
        { provide: DataSource, useValue: { getRepository: jest.fn().mockReturnValue(repo) } },
        { provide: StudentService, useValue: studentService },
        { provide: ModelService, useValue: modelService },
        { provide: LabService, useValue: labService },
      ],
    }).compile();

    service = module.get(CheckService);
  });

  it('loads relations and saves a check with the dto fields', async () => {
    const student = { id: 1 };
    const lab = { id: 2 };
    const model = { id: 3 };

    studentService.findOne.mockResolvedValue(student);
    labService.findOne.mockResolvedValue(lab);
    modelService.findOne.mockResolvedValue(model);

    const check = await service.create({
      studentId: 1,
      labId: 2,
      modelId: 3,
      review: 'review text',
      advantages: 'advantage A\nadvantage B',
      disadvantages: 'disadvantage A',
      grade: 8,
      report: 'student report',
    });

    expect(studentService.findOne).toHaveBeenCalledWith(1);
    expect(labService.findOne).toHaveBeenCalledWith(2);
    expect(modelService.findOne).toHaveBeenCalledWith(3);
    expect(repo.create).toHaveBeenCalledWith({
      review: 'review text',
      grade: 8,
      disadvantages: 'disadvantage A',
      advantages: 'advantage A\nadvantage B',
      student,
      lab,
      model,
      report: 'student report',
      promptInjectionDetected: false,
      promptInjectionRisk: 'none',
      promptInjectionFragments: '',
      securityComment: '',
    });
    expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ id: 99 }));
    expect(check).toMatchObject({ id: 99, student, lab, model, grade: 8 });
  });
});
