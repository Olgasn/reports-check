import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CourseService {
  private readonly courseRepo: Repository<Course>;

  constructor(private readonly dataSource: DataSource) {
    this.courseRepo = this.dataSource.getRepository(Course);
  }

  async findOne(id: number) {
    const course = await this.courseRepo.findOne({ where: { id } });

    if (!course) {
      throw new NotFoundException('Курс не был найден.');
    }

    return course;
  }

  findMany() {
    return this.courseRepo.find();
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
}
