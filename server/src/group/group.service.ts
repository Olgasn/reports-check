import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, FindOptionsRelations, Repository } from 'typeorm';
import { Group } from './entities/group.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupOpDto } from './dto/group-op.dto';
import { StudentService } from 'src/student/student.service';
import { StudentsSearchDto } from 'src/student/dto/students-search.dto';

@Injectable()
export class GroupService {
  private readonly groupRepo: Repository<Group>;

  constructor(
    private readonly dataSource: DataSource,
    @Inject(forwardRef(() => StudentService))
    private readonly studentService: StudentService,
  ) {
    this.groupRepo = this.dataSource.getRepository(Group);
  }

  async findOne(id: number, relations: FindOptionsRelations<Group> = {}) {
    const group = await this.groupRepo.findOne({ where: { id }, relations });

    if (!group) {
      throw new NotFoundException('Группа не была найдена.');
    }

    return group;
  }

  findMany() {
    return this.groupRepo.find();
  }

  create(createGroupDto: CreateGroupDto) {
    const groupPlain = this.groupRepo.create(createGroupDto);

    return this.groupRepo.save(groupPlain);
  }

  async update(id: number, updateGroupDto: UpdateGroupDto) {
    const group = await this.findOne(id);

    Object.assign(group, updateGroupDto);

    return this.groupRepo.save(group);
  }

  async delete(id: number) {
    const group = await this.findOne(id);

    await this.groupRepo.remove(group);
  }

  async isMember(groupOpDto: GroupOpDto) {
    const { studentId, groupId } = groupOpDto;
    const group = await this.findOne(groupId, { students: true });
    const student = await this.studentService.findOne(studentId);
    const isMember = group.students.some((st) => st.id === studentId);

    return { group, student, isMember };
  }

  async addMember(groupOpDto: GroupOpDto) {
    const { group, student, isMember } = await this.isMember(groupOpDto);

    if (isMember) {
      throw new BadRequestException('User is already a member of the group.');
    }

    group.students = [...group.students, student];

    await this.groupRepo.save(group);
  }

  async removeMember(groupOpDto: GroupOpDto) {
    const { group, student, isMember } = await this.isMember(groupOpDto);

    if (!isMember) {
      throw new BadRequestException("User isn't a member of the group.");
    }

    group.students = group.students.filter((st) => st.id !== student.id);

    await this.groupRepo.save(group);
  }

  async getGroupStudents(dto: StudentsSearchDto) {
    await this.findOne(dto.groupId);

    return this.studentService.searchStudents(dto);
  }
}
