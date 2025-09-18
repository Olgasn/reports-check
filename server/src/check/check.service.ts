import { Injectable } from '@nestjs/common';
import { DataSource, In, Repository } from 'typeorm';
import { Check } from './entities/check.entity';
import { StudentService } from 'src/student/student.service';
import { ModelService } from 'src/model/model.service';
import { LabService } from 'src/lab/lab.service';
import { CreateCheckDto } from './dto/create-check.dto';
import { CheckGrDto } from './dto/check-gr.dto';

@Injectable()
export class CheckService {
  private readonly checkRepo: Repository<Check>;

  constructor(
    private readonly dataSource: DataSource,
    private readonly studentService: StudentService,
    private readonly modelService: ModelService,
    private readonly labService: LabService,
  ) {
    this.checkRepo = this.dataSource.getRepository(Check);
  }

  async getStudentChecks(studentId: number) {
    return this.checkRepo.find({
      where: {
        student: {
          id: studentId,
        },
      },
    });
  }

  async getByIds(ids: number[]) {
    return this.checkRepo.find({
      where: {
        id: In(ids),
      },
      relations: {
        student: true,
        model: true,
      },
    });
  }

  async findLastCheck(studentId: number) {
    return this.checkRepo.findOne({
      where: {
        student: {
          id: studentId,
        },
      },
      order: {
        date: 'DESC',
      },
    });
  }

  async create(createCheckDto: CreateCheckDto) {
    const { review, advantages, disadvantages, studentId, labId, modelId, grade, report } =
      createCheckDto;

    const student = await this.studentService.findOne(studentId);
    const lab = await this.labService.findOne(labId);
    const model = await this.modelService.findOne(modelId);

    const checkPlain = this.checkRepo.create({
      review,
      grade,
      disadvantages,
      advantages,
      student,
      lab,
      model,
      report,
    });

    const check = await this.checkRepo.save(checkPlain);

    return check;
  }

  async getLabChecks(labId: number) {
    const lab = await this.labService.findOne(labId, {
      checks: {
        lab: true,
        student: {
          group: true,
        },
        model: true,
      },
    });

    const checks = lab.checks;

    const groups: Record<string, CheckGrDto> = {};

    for (const check of checks) {
      const group = check.student.group;

      if (!groups[group.id]) {
        groups[group.id] = { group, results: [] };
      }

      const st = groups[group.id].results.find((gr) => gr.student.id === check.student.id);

      if (!st) {
        groups[group.id].results.push({
          student: check.student,
          checks: [check],
        });
      } else {
        groups[group.id].results = groups[group.id].results.map((gr) => {
          if (gr.student.id === check.student.id) {
            return {
              student: gr.student,
              checks: [...gr.checks, check],
            };
          }

          return gr;
        });
      }
    }

    const result = Object.values(groups);

    return result;
  }

  async findByLabs(labId: number) {
    const lab = await this.labService.findOne(labId, {
      checks: {
        lab: true,
        student: true,
      },
    });

    return lab.checks;
  }

  async findByStudent(labId: number, studentId: number) {
    const check = await this.checkRepo.findOne({
      where: {
        lab: {
          id: labId,
        },
        student: {
          id: studentId,
        },
      },
      relations: {
        lab: true,
        student: true,
      },
    });

    return check;
  }
}
