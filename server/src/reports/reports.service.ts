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
import { GetChecksDto } from 'src/check/dto/get-checks.dto';
import { NotificationService } from 'src/notification/notification.service';

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
    private readonly notificationService: NotificationService,
  ) {}

  async getLabChecks(labId: number) {
    return this.checkService.getLabChecks(labId);
  }

  async getChecks(dto: GetChecksDto) {
    return this.checkService.getByIds(dto.ids);
  }

  async preparePrompt(standardFn: () => string, usePrev?: boolean, stId?: number) {
    const prompt = standardFn();

    if (!usePrev || !stId) {
      return prompt;
    }

    const prevCheck = await this.checkService.findLastCheck(stId);

    if (!prevCheck) {
      return prompt;
    }

    return this.promptService.preparePrevPrompt({
      ...prevCheck,
      grade: String(prevCheck.grade),
      promptTxt: prompt,
    });
  }

  handleCheck(checkReportDto: CheckReportMulDto) {
    if (checkReportDto.modelsId.length >= 2) {
      return this.checkReportByMultipleModels(checkReportDto);
    }

    return this.checkReports({ ...checkReportDto, modelId: checkReportDto.modelsId[0] });
  }

  handleCheckReports(checkReportDto: CheckReportMulDto) {
    const func = async () => {
      try {
        this.notificationService.checkStarted();

        const results = await this.handleCheck(checkReportDto);

        const ids = results.map((check) => check.id);

        this.notificationService.reportsChecked(ids, checkReportDto.labId);
      } catch {
        this.notificationService.checkFailed();
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    setImmediate(func);
  }

  async checkReportByMultipleModels(checkReportDto: CheckReportMulDto) {
    const { labId, modelsId, reportsZip, checkPrev } = checkReportDto;
    const reviewModelId = modelsId.at(-1);

    //const students = await this.studentService.findByIds(studentsId);

    if (!reviewModelId) {
      throw new BadRequestException('Incorrect data');
    }

    const lab = await this.labService.findOne(labId, { course: { prompt: true } });
    const models = await this.modelService.findByIds(modelsId);
    const modelReview = await this.modelService.findOne(reviewModelId);

    const { content } = lab.course.prompt;
    const task = lab.content;

    const repData = await this.fileService.parseArchive(reportsZip.buffer);
    const reportsData = repData;

    const promises: Promise<CheckResult[]>[] = [];

    for (const model of models) {
      const checkPromises = reportsData.map((report) =>
        this.checkOneReport({ report, task, content, model, groupId: 1, checkPrev, labId: lab.id }),
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
    const { labId, modelId, reportsZip, groupId, checkPrev } = checkReportDto;

    //const students = await this.studentService.findByIds(studentsId);

    const lab = await this.labService.findOne(labId, { course: { prompt: true } });
    const model = await this.modelService.findOne(modelId);

    const { content } = lab.course.prompt;
    const task = lab.content;
    const repData = await this.fileService.parseArchive(reportsZip.buffer);

    const reportsData = repData;

    const promises = reportsData.map(async (report) => {
      return this.checkOneReport({
        report,
        task,
        content,
        model,
        groupId,
        checkPrev,
        labId: lab.id,
      });
    });

    const resultPromises = await Promise.allSettled(promises);
    const results: CheckResult[] = [];

    for (const result of resultPromises) {
      if (result.status === 'fulfilled') {
        results.push(result.value);

        continue;
      }
    }

    for (const result of results) {
      if (
        !repData.some(
          (rp) =>
            rp.name === result.student.name &&
            rp.surname === result.student.surname &&
            rp.middlename === result.student.middlename,
        )
      ) {
        const studentStr = `${result.student.name} ${result.student.surname} ${result.student.middlename}`;

        this.notificationService.reportOneFailed({
          student: studentStr,
          model: model.name,
          id: result.student.id,
          labId: lab.id,
        });
      }
    }

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
    checkPrev: boolean;
    labId: number;
  }) {
    const { report, task, content, model, groupId, checkPrev, labId } = data;

    const studentStr = `${report.name} ${report.surname} ${report.middlename}`;

    const studentFound = await this.studentService.findRawStudent(
      report.name,
      report.surname,
      report.middlename,
    );

    let student = studentFound;

    if (!student) {
      const { name, surname, middlename } = report;

      student = await this.studentService.create({ name, surname, middlename, groupId });
    }

    this.notificationService.reportOneStarted({
      student: studentStr,
      model: model.name,
      id: student.id,
      labId,
    });
    this.logger.log(`Начал провека отчета студента [${studentStr}] моделью [${model.name}]`);

    const prompt = await this.preparePrompt(
      () => this.promptService.preparePrompt(report.content, task, content),
      checkPrev,
      studentFound?.id,
    );

    const result = await this.llmService.query(prompt, model);

    this.fileService.writeFile({
      name: `${Date.now()}_model_${model.name}.txt`,
      folder: 'models_logs',
      content: result,
    });

    this.notificationService.reportOneChecked({
      student: studentStr,
      model: model.name,
      id: student.id,
      labId,
    });
    this.logger.log(`Отчет студента [${studentStr}] был проверен моделью [${model.name}]`);

    const resultDto = await this.llmService.extractData(CheckResultDto, result);

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
