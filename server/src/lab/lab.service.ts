import { Injectable, NotFoundException } from '@nestjs/common';
import { Lab } from './entities/lab.entity';
import { CreateLabDto } from './dto/create-lab.dto';
import { UpdateLabDto } from './dto/update-course.dto';
import { Repository, DataSource } from 'typeorm';
import { CourseService } from 'src/course/course.service';
import { FileService } from 'src/file/file.service';

@Injectable()
export class LabService {
  private readonly labRepo: Repository<Lab>;

  constructor(
    private readonly dataSource: DataSource,
    private readonly courseService: CourseService,
    private readonly fileService: FileService,
  ) {
    this.labRepo = this.dataSource.getRepository(Lab);
  }

  async findOne(id: number) {
    const lab = await this.labRepo.findOne({ where: { id } });

    if (!lab) {
      throw new NotFoundException('Лабораторная не была найдена.');
    }

    return lab;
  }

  findMany() {
    return this.labRepo.find();
  }

  async prepareFile(file: Express.Multer.File) {
    const content = await this.fileService.parseFile(file.originalname, file.buffer);
    const filepath = this.fileService.writeFile({
      name: `task_${Date.now()}.txt`,
      folder: 'labs',
      content,
    });

    const filename = Buffer.from(file.originalname, 'latin1').toString('utf8');

    return { filepath, filename, filesize: content.length };
  }

  async create(createLabDto: CreateLabDto) {
    const { task, name, description, courseId } = createLabDto;
    const course = await this.courseService.findOne(courseId);

    const { filename, filesize, filepath } = await this.prepareFile(task);
    const labPlain = this.labRepo.create({
      name,
      description,
      course,
      filename,
      filesize,
      filepath,
    });

    return this.labRepo.save(labPlain);
  }

  async update(id: number, updateLabDto: UpdateLabDto) {
    const { task, name, description, courseId } = updateLabDto;
    const lab = await this.findOne(id);

    if (courseId) {
      const course = await this.courseService.findOne(courseId);

      lab.course = course;
    }

    if (task) {
      const { filename, filesize, filepath } = await this.prepareFile(task);

      lab.filename = filename;
      lab.filesize = filesize;
      lab.filepath = filepath;
    }

    Object.assign(lab, { name, description });

    return this.labRepo.save(lab);
  }

  async delete(id: number) {
    const lab = await this.findOne(id);

    await this.labRepo.remove(lab);
  }
}
