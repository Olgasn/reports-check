import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, FindOptionsWhere, ILike, In, Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { GroupService } from 'src/group/group.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentsSearchDto } from './dto/students-search.dto';
import { StudentsPaginatedDto } from './dto/students-paginated.dto';
import { Group } from 'src/group/entities/group.entity';
import { ImportStudentsCsvResultDto } from './dto/import-students-csv.dto';
import * as iconv from 'iconv-lite';

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

  async importFromCsv(csvFile: Express.Multer.File): Promise<ImportStudentsCsvResultDto> {
    if (!csvFile) {
      throw new BadRequestException('CSV файл не был загружен.');
    }

    const content = this.decodeCsv(csvFile.buffer);
    const parsedRows = this.parseCsv(content);

    if (parsedRows.length < 2) {
      throw new BadRequestException('CSV файл пустой или содержит только заголовки.');
    }

    const headers = parsedRows[0].map((header) => this.normalizeHeader(header));
    const dataRows = parsedRows.slice(1);

    const nameIdx = headers.findIndex((h) => h === 'имя' || h === 'firstname');
    const surnameIdx = headers.findIndex((h) => h.startsWith('фам') || h === 'lastname');
    const middlenameIdx = headers.findIndex((h) => h.startsWith('отче') || h === 'middlename');
    const groupsIdx = headers.findIndex((h) => h.startsWith('групп') || h === 'groups');

    if (nameIdx === -1 || surnameIdx === -1 || groupsIdx === -1) {
      throw new BadRequestException('В CSV должны быть столбцы: Имя, Фамилия и Группы.');
    }

    const result = await this.dataSource.transaction(async (manager) => {
      const groupRepo = manager.getRepository(Group);
      const studentRepo = manager.getRepository(Student);

      const groupCache = new Map<string, Group>();
      const groups = await groupRepo.find();

      for (const group of groups) {
        groupCache.set(this.normalizeGroupName(group.name), group);
      }

      let createdStudents = 0;
      let duplicateStudents = 0;
      let createdGroups = 0;
      let skippedRows = 0;

      for (const row of dataRows) {
        if (!row.some((item) => item.trim().length > 0)) {
          continue;
        }

        const name = (row[nameIdx] ?? '').trim();
        const surname = (row[surnameIdx] ?? '').trim();
        const middlenameRaw = middlenameIdx === -1 ? '' : (row[middlenameIdx] ?? '').trim();
        const middlename = middlenameRaw || '-';
        const groupNameRaw = (row[groupsIdx] ?? '').trim();
        const groupName = this.pickPrimaryGroup(groupNameRaw);

        if (!name || !surname || !groupName) {
          skippedRows++;

          continue;
        }

        const normalizedGroupName = this.normalizeGroupName(groupName);
        let group = groupCache.get(normalizedGroupName);

        if (!group) {
          const groupPlain = groupRepo.create({ name: groupName });

          group = await groupRepo.save(groupPlain);
          groupCache.set(normalizedGroupName, group);
          createdGroups++;
        }

        const studentFound = await studentRepo.findOne({
          where: {
            name,
            surname,
            middlename,
            group: {
              id: group.id,
            },
          },
        });

        if (studentFound) {
          duplicateStudents++;

          continue;
        }

        const studentPlain = studentRepo.create({
          name,
          surname,
          middlename,
          group,
        });

        await studentRepo.save(studentPlain);

        createdStudents++;
      }

      return {
        totalRows: dataRows.length,
        createdStudents,
        duplicateStudents,
        createdGroups,
        skippedRows,
      };
    });

    return result;
  }

  decodeCsv(buffer: Buffer) {
    const utf8 = buffer.toString('utf-8').replace(/^\uFEFF/, '');

    if (this.hasRequiredHeaders(utf8)) {
      return utf8;
    }

    const win1251 = iconv.decode(buffer, 'win1251').replace(/^\uFEFF/, '');

    return win1251;
  }

  hasRequiredHeaders(content: string) {
    const [firstLine = ''] = content.split(/\r?\n/, 1);
    const line = firstLine.toLowerCase();

    return line.includes('имя') && line.includes('фам');
  }

  parseCsv(content: string) {
    const delimiter = this.detectDelimiter(content);
    const rows: string[][] = [];
    let row: string[] = [];
    let field = '';
    let inQuotes = false;

    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      const next = content[i + 1];

      if (char === '"') {
        if (inQuotes && next === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }

        continue;
      }

      if (char === delimiter && !inQuotes) {
        row.push(field.trim());
        field = '';

        continue;
      }

      if ((char === '\n' || char === '\r') && !inQuotes) {
        if (char === '\r' && next === '\n') {
          i++;
        }

        row.push(field.trim());
        field = '';

        if (row.some((value) => value.length > 0)) {
          rows.push(row);
        }

        row = [];

        continue;
      }

      field += char;
    }

    if (field.length > 0 || row.length > 0) {
      row.push(field.trim());

      if (row.some((value) => value.length > 0)) {
        rows.push(row);
      }
    }

    return rows;
  }

  detectDelimiter(content: string) {
    const [header = ''] = content.split(/\r?\n/, 1);
    const commas = (header.match(/,/g) ?? []).length;
    const semicolons = (header.match(/;/g) ?? []).length;

    return semicolons > commas ? ';' : ',';
  }

  pickPrimaryGroup(raw: string) {
    return raw
      .split(/[;,]/)
      .map((item) => item.trim())
      .find((item) => item.length > 0);
  }

  normalizeHeader(header: string) {
    return header.trim().toLowerCase().replace(/\s+/g, ' ');
  }

  normalizeGroupName(name: string) {
    return name.trim().toLowerCase();
  }
}
