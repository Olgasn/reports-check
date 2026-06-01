import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CourseService } from 'src/course/course.service';
import { CreatePromptDto } from './dto/create-prompt.dto';
import { UpdatePromptDto } from './dto/update-promt.dto';
import { ConfigService } from '@nestjs/config';
import { PromptConfig } from 'src/types/config.types';
import { Prompt } from './entities/prompt.entity';
import { PromptInjectionAnalysis } from 'src/security/prompt-injection.service';

export type SplitPrompt = { system: string; user: string };

const DEFAULT_SECURITY_CONTEXT = {
  detected: false,
  riskLevel: 'none',
  indicators: [],
  fragments: [],
} as const satisfies PromptInjectionAnalysis;

@Injectable()
export class PromptService {
  private readonly promptRepo: Repository<Prompt>;
  private readonly template: string;
  private readonly templateMultiple: string;
  private readonly templatePrev: string;

  constructor(
    private readonly dataSource: DataSource,
    private readonly courseService: CourseService,
    private readonly configService: ConfigService,
  ) {
    this.promptRepo = this.dataSource.getRepository(Prompt);

    const { template, templateMultiple, templatePrev } =
      this.configService.get<PromptConfig>('prompt')!;

    this.template = template;
    this.templateMultiple = templateMultiple;
    this.templatePrev = templatePrev;
  }

  findMany() {
    return this.promptRepo.find();
  }

  private splitAtMarker(template: string): SplitPrompt {
    const parts = template.split('@SPLIT');
    if (parts.length < 2) {
      return { system: '', user: template };
    }
    return {
      system: parts[0].trimEnd(),
      user: parts[1].replace(/^\r?\n/, ''),
    };
  }

  buildUntrustedBlock(label: string, content: string) {
    const tag = `UNTRUSTED_${label.toUpperCase()}`;
    const sanitized = this.sanitizeUntrustedText(content, tag);

    return `<${tag}>\n${sanitized}\n</${tag}>`;
  }

  sanitizeUntrustedText(content: string, tag?: string) {
    let sanitized = content
      .replace(/@SPLIT/g, '[REMOVED_SPLIT_MARKER]')
      .replace(/<\/?JSON>/gi, '[REMOVED_JSON_MARKER]');

    if (tag) {
      sanitized = sanitized.replace(
        new RegExp(`<\\s*/?\\s*${tag}\\s*>`, 'gi'),
        `[REMOVED_${tag}_MARKER]`,
      );
    }

    return sanitized;
  }

  formatSecurityContext(analysis: PromptInjectionAnalysis = DEFAULT_SECURITY_CONTEXT) {
    return JSON.stringify(
      {
        promptInjectionDetected: analysis.detected,
        promptInjectionRisk: analysis.riskLevel,
        indicators: analysis.indicators,
        suspiciousFragments: analysis.fragments,
      },
      null,
      2,
    );
  }

  preparePrevPrompt(data: {
    review: string;
    grade: string;
    advantages: string;
    disadvantages: string;
    promptTxt: string;
    report: string;
  }, securityAnalysis: PromptInjectionAnalysis = DEFAULT_SECURITY_CONTEXT) {
    let template = this.templatePrev;

    template = template.replace('@PROMPT', data.promptTxt);
    template = template.replace('@SECURITY_CONTEXT', this.formatSecurityContext(securityAnalysis));
    template = template.replace('@PREV_REVIEW', data.review);
    template = template.replace('@PREV_GRADE', data.grade);
    template = template.replace('@PREV_ADVANTAGES', data.advantages);
    template = template.replace('@PREV_DISADVANTAGES', data.disadvantages);
    template = template.replace('@PREV_REPORT', this.buildUntrustedBlock('previous_report', data.report));

    return template;
  }

  prepareMultiplePrompt(data: {
    task: string;
    answer: string;
    content: string;
    checks: unknown[];
    securityAnalysis?: PromptInjectionAnalysis;
  }): SplitPrompt {
    const { task, answer, content, checks, securityAnalysis } = data;
    const checksJson = JSON.stringify(checks, null, 2);
    const template = this.templateMultiple
      .replace('@SECURITY_CONTEXT', this.formatSecurityContext(securityAnalysis))
      .replace('@PROMPT_TEXT', content)
      .replace('@LAB_TASK', task)
      .replace('@STUDENT_ANSWER', this.buildUntrustedBlock('student_report', answer))
      .replace('@MODELS_CHECK_RESULT', this.buildUntrustedBlock('model_check_results', checksJson));

    return this.splitAtMarker(template);
  }

  preparePrompt(
    answer: string,
    task: string,
    content: string,
    securityAnalysis: PromptInjectionAnalysis = DEFAULT_SECURITY_CONTEXT,
  ): SplitPrompt {
    const template = this.template
      .replace('@SECURITY_CONTEXT', this.formatSecurityContext(securityAnalysis))
      .replace('@PROMPT_TEXT', content)
      .replace('@LAB_TASK', task)
      .replace('@STUDENT_ANSWER', this.buildUntrustedBlock('student_report', answer));

    return this.splitAtMarker(template);
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
