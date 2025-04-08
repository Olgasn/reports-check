import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Check } from './entities/check.entity';
import { StudentService } from 'src/student/student.service';
import { ModelService } from 'src/model/model.service';
import { LabService } from 'src/lab/lab.service';
import { CreateCheckDto } from './dto/create-check.dto';

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
