import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CheckReportDto } from './dto/check-report.dto';
import { FileService } from 'src/file/file.service';
import { LlmService } from 'src/llm/llm.service';
import { ModelService } from 'src/model/model.service';
import { CheckResultDto } from './dto/check-result.dto';
import { CheckService } from 'src/check/check.service';
import { LabService } from 'src/lab/lab.service';
import { StudentService } from 'src/student/student.service';
import { PromptService } from 'src/prompt/prompt.service';
import { CheckReportMulDto } from './dto/check-report-mul.dto';
import { CheckResult, ReportCheck } from 'src/types/reports.types';
import { Model } from 'src/model/entities/model.entity';
import { Check } from 'src/check/entities/check.entity';
import { Student } from 'src/student/entities/student.entity';
import { GroupService } from 'src/group/group.service';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    private readonly fileService: FileService,
    private readonly llmService: LlmService,
    private readonly modelService: ModelService,
    private readonly checkService: CheckService,
    private readonly labService: LabService,
    private readonly studentService: StudentService,
    private readonly promptService: PromptService,
    private readonly groupService: GroupService,
  ) {}

  async getLabChecks(labId: number) {
    return this.checkService.getLabChecks(labId);
  }

  async checkReportByMultipleModels(checkReportDto: CheckReportMulDto) {
    const { labId, modelsId, reportsZip } = checkReportDto;
    const reviewModelId = modelsId.at(-1);

    if (!reviewModelId) {
      throw new BadRequestException('Incorrect data');
    }

    const lab = await this.labService.findOne(labId, { course: { prompt: true } });
    const models = await this.modelService.findByIds(modelsId);
    const modelReview = await this.modelService.findOne(reviewModelId);

    const { content } = lab.course.prompt;
    const task = lab.content;

    const reportsData = await this.fileService.parseArchive(reportsZip.buffer);

    const promises: Promise<CheckResult[]>[] = [];

    for (const model of models) {
      const checkPromises = reportsData.map((report) =>
        this.checkOneReport({ report, task, content, model, groupId: 1 }),
      );

      promises.push(Promise.all(checkPromises));
    }

    const results = await Promise.all(promises);

    const reviewData: { student: Student; result: string[]; answer: string }[] = [];

    for (let i = 0; i < results[0].length; i++) {
      const check: string[] = [];
      const answer: string = results[0][i].answer;

      for (const result of results) {
        const checkStr = `
          Review: ${result[i].review}
          Grade: ${result[i].grade}
          Advantages: ${result[i].advantages.join(', ')}
          Disadvantages: ${result[i].disadvantages.join(', ')}
        `;

        check.push(checkStr);
      }

      reviewData.push({ student: results[0][i].student, result: check, answer });
    }

    const reviewResults = await Promise.all(
      reviewData.map(async (data) => {
        const { student, result, answer } = data;

        const studentStr = `${student.name} ${student.surname} ${student.middlename}`;

        this.logger.log(
          `Началось сведение ответов для студента [${studentStr}] моделью [${modelReview.name}]`,
        );

        const prompt = this.promptService.prepareMultiplePrompt({
          task,
          answer,
          checks: result,
          content,
        });

        const reviewModelResponse = await this.llmService.query(prompt, modelReview);

        this.fileService.writeFile({
          name: `${Date.now()}_model_${modelReview.name}.txt`,
          folder: 'models_logs',
          content: reviewModelResponse,
        });

        this.logger.log(
          `Закончилось сведение ответов для студента [${studentStr}] моделью [${modelReview.name}]`,
        );

        const resultDto = await this.llmService.extractData(CheckResultDto, reviewModelResponse);

        const finalResult: CheckResult = {
          student,
          grade: resultDto.grade,
          review: resultDto.review,
          advantages: resultDto.advantages,
          disadvantages: resultDto.disadvantages,
          model: modelReview,
          answer,
        };

        return finalResult;
      }),
    );

    const checks: Check[] = [];

    for (const result of reviewResults) {
      const check = await this.checkService.create({
        review: result.review,
        advantages: result.advantages.join('\n'),
        disadvantages: result.disadvantages.join('\n'),
        studentId: result.student.id,
        labId,
        modelId: modelReview.id,
        grade: result.grade,
        report: '',
      });

      checks.push(check);
    }

    return checks;
  }

  async checkReports(checkReportDto: CheckReportDto) {
    const { labId, modelId, reportsZip, groupId } = checkReportDto;

    const lab = await this.labService.findOne(labId, { course: { prompt: true } });
    const model = await this.modelService.findOne(modelId);

    const { content } = lab.course.prompt;
    const task = lab.content;

    const reportsData = await this.fileService.parseArchive(reportsZip.buffer);

    const promises = reportsData.map(async (report) =>
      this.checkOneReport({ report, task, content, model, groupId }),
    );

    const resultPromises = await Promise.allSettled(promises);
    const results = resultPromises
      .filter((pr) => pr.status === 'fulfilled')
      .map((pr) => pr.value)
      .filter((pr) => !!pr);

    const checks: Check[] = [];

    for (const result of results) {
      const check = await this.checkService.create({
        review: result.review,
        advantages: result.advantages.join('\n'),
        disadvantages: result.disadvantages.join('\n'),
        studentId: result.student.id,
        labId,
        modelId,
        grade: result.grade,
        report: result.answer,
      });

      checks.push(check);
    }

    return checks;
  }

  async checkOneReport(data: {
    report: ReportCheck;
    task: string;
    content: string;
    model: Model;
    groupId: number;
  }) {
    const { report, task, content, model, groupId } = data;

    const studentStr = `${report.name} ${report.surname} ${report.middlename}`;

    const studentFound = await this.studentService.findByNum(report.num);

    this.logger.log(`Начал провека отчета студента [${studentStr}] моделью [${model.name}]`);

    const prompt = this.promptService.preparePrompt(report.content, task, content);

    const result = await this.llmService.query(prompt, model);

    this.fileService.writeFile({
      name: `${Date.now()}_model_${model.name}.txt`,
      folder: 'models_logs',
      content: result,
    });

    this.logger.log(`Отчет студента [${studentStr}] был проверен моделью [${model.name}]`);

    const resultDto = await this.llmService.extractData(CheckResultDto, result);

    let student = studentFound;

    if (!student) {
      const { name, surname, middlename, num } = report;

      student = await this.studentService.create({ name, surname, middlename, num, groupId });
    }

    const check: CheckResult = {
      student,
      grade: resultDto.grade,
      review: resultDto.review,
      advantages: resultDto.advantages,
      disadvantages: resultDto.disadvantages,
      model,
      answer: report.content,
    };

    return check;
  }
}
