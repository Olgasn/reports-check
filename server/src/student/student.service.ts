import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, FindOptionsWhere, ILike, In, Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { GroupService } from 'src/group/group.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentsSearchDto } from './dto/students-search.dto';
import { StudentsPaginatedDto } from './dto/students-paginated.dto';

@Injectable()
export class StudentService {
  private readonly studentRepo: Repository<Student>;

  constructor(
    private readonly dataSource: DataSource,
    @Inject(forwardRef(() => GroupService))
    private readonly groupService: GroupService,
  ) {
    this.studentRepo = this.dataSource.getRepository(Student);
  }

  async findByIds(ids: number[]) {
    return this.studentRepo.find({
      where: {
        id: In(ids),
      },
    });
  }

  async findRawStudent(name: string, surname: string, middlename: string) {
    return this.studentRepo.findOne({
      where: {
        name,
        surname,
        middlename,
      },
    });
  }

  async findOne(id: number) {
    const student = await this.studentRepo.findOne({
      where: { id },
      relations: {
        group: true,
      },
    });

    if (!student) {
      throw new NotFoundException('Студент не был найден.');
    }

    return student;
  }

  findMany(cond: FindOptionsWhere<Student> = {}) {
    return this.studentRepo.find({ where: cond, relations: { group: true } });
  }

  async searchStudents(searchStudentDto: StudentsSearchDto) {
    const { offset, pageSize, search, groupId } = searchStudentDto;

    const [items, count] = await this.studentRepo.findAndCount({
      skip: offset,
      take: pageSize,
      where: {
        surname: ILike(`%${search}%`),
        group: {
          id: groupId,
        },
      },
    });

    return new StudentsPaginatedDto(items, count, searchStudentDto);
  }

  async create(createStudentDto: CreateStudentDto) {
    const { name, surname, middlename, groupId } = createStudentDto;
    const studentPlain = this.studentRepo.create({ name, surname, middlename });

    if (groupId) {
      const group = await this.groupService.findOne(groupId);

      studentPlain.group = group;
    }

    return this.studentRepo.save(studentPlain);
  }

  async update(id: number, updateStudentDto: UpdateStudentDto) {
    const student = await this.findOne(id);
    const { name, surname, middlename, groupId } = updateStudentDto;

    if (groupId) {
      const group = await this.groupService.findOne(groupId);

      student.group = group;
    }

    Object.assign(student, { name, surname, middlename });

    return this.studentRepo.save(student);
  }

  async delete(id: number) {
    const student = await this.findOne(id);

    await this.studentRepo.remove(student);
  }
}
