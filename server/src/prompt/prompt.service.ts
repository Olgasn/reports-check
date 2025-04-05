import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Prompt } from './entities/prompt.entity';
import { CourseService } from 'src/course/course.service';
import { CreatePromptDto } from './dto/create-prompt.dto';
import { UpdatePromptDto } from './dto/update-promt.dto';

@Injectable()
export class PromptService {
  private readonly promptRepo: Repository<Prompt>;

  constructor(
    private readonly dataSource: DataSource,
    private readonly courseService: CourseService,
  ) {
    this.promptRepo = this.dataSource.getRepository(Prompt);
  }

  findMany() {
    return this.promptRepo.find();
  }

  async findOne(id: number) {
    const prompt = await this.promptRepo.findOne({ where: { id } });

    if (!prompt) {
      throw new NotFoundException('Промпт не был найден.');
    }

    return prompt;
  }

  async create(createPromtDto: CreatePromptDto) {
    const { content, courseId } = createPromtDto;
    const course = await this.courseService.findOne(courseId);
    const promptPlain = this.promptRepo.create({ content, course });

    return this.promptRepo.save(promptPlain);
  }

  async update(id: number, updatePromptDto: UpdatePromptDto) {
    const { content, courseId } = updatePromptDto;
    const prompt = await this.findOne(id);

    if (courseId) {
      const course = await this.courseService.findOne(courseId);

      prompt.course = course;
    }

    Object.assign(prompt, { content });

    return this.promptRepo.save(prompt);
  }

  async delete(id: number) {
    const prompt = await this.findOne(id);

    await this.promptRepo.remove(prompt);
  }
}
