import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, FindOptionsRelations, ILike, Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { SearchCourseDto } from './dto/search-course.dto';
import { CoursePaginatedDto } from './dto/course-paginated.dto';

@Injectable()
export class CourseService {
  private readonly courseRepo: Repository<Course>;

  constructor(private readonly dataSource: DataSource) {
    this.courseRepo = this.dataSource.getRepository(Course);
  }

  async findOne(id: number, relations: FindOptionsRelations<Course> = { prompt: true }) {
    const course = await this.courseRepo.findOne({
      where: { id },
      relations,
    });

    if (!course) {
      throw new NotFoundException('Курс не был найден.');
    }

    return course;
  }

  async findMany(dto: SearchCourseDto) {
    const { pageSize, offset, name } = dto;

    const [items, count] = await this.courseRepo.findAndCount({
      skip: offset,
      take: pageSize,
      where: {
        name: ILike(`%${name}%`),
      },
    });

    return new CoursePaginatedDto(items, count, dto);
  }

  async findAllCourses() {
    return this.courseRepo.find({
      select: {
        id: true,
        name: true,
      },
    });
  }

  findWithLabs() {
    return this.courseRepo.find({
      relations: {
        labs: true,
      },
    });
  }

  create(createCourseDto: CreateCourseDto) {
    const coursePlain = this.courseRepo.create(createCourseDto);

    return this.courseRepo.save(coursePlain);
  }

  async update(id: number, updateCourseDto: UpdateCourseDto) {
    const course = await this.findOne(id);

    Object.assign(course, updateCourseDto);

    return this.courseRepo.save(course);
  }

  async delete(id: number) {
    const course = await this.findOne(id);

    await this.courseRepo.remove(course);
  }

  async getLabs(id: number) {
    const course = await this.courseRepo.findOne({
      where: { id },
      relations: {
        labs: true,
      },
    });

    if (!course) {
      throw new NotFoundException('Курс не был найден.');
    }

    return course.labs;
  }
}
