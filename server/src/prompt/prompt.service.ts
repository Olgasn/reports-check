import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CourseService } from 'src/course/course.service';
import { CreatePromptDto } from './dto/create-prompt.dto';
import { UpdatePromptDto } from './dto/update-promt.dto';
import { ConfigService } from '@nestjs/config';
import { PromptConfig } from 'src/types/config.types';
import { Prompt } from './entities/prompt.entity';

@Injectable()
export class PromptService {
  private readonly promptRepo: Repository<Prompt>;
  private readonly template: string;

  constructor(
    private readonly dataSource: DataSource,
    private readonly courseService: CourseService,
    private readonly configService: ConfigService,
  ) {
    this.promptRepo = this.dataSource.getRepository(Prompt);

    const { template } = this.configService.get<PromptConfig>('prompt')!;

    this.template = template;
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
