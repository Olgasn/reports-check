import { Injectable, Logger } from '@nestjs/common';
import { ReportStrategy } from './report-strategy.interface';
import { CheckReportDto } from '../dto/check-report.dto';
import { FileService } from 'src/file/file.service';
import { LabService } from 'src/lab/lab.service';
import { ModelService } from 'src/model/model.service';
import { isSimilarStudents } from '../reports.utils';
import { ReportCheck } from '../providers/report-check.provider';
import { CheckResult } from 'src/types/reports.types';
import { LlmService } from 'src/llm/llm.service';
import { PromptService } from 'src/prompt/prompt.service';
import { CheckResultDto } from '../dto/check-result.dto';
import {
  CombineCheckResultDto,
  CombineCheckResultsDto,
  ModelCheckResultSummary,
  MultipleReviewDto,
} from '../reports.types';
import { PromptInjectionService } from 'src/security/prompt-injection.service';

@Injectable()
export class MultipleModelStrategy implements ReportStrategy {
  private readonly logger = new Logger(ReportCheck.name);

  constructor(
    private readonly reportCheck: ReportCheck,
    private readonly labService: LabService,
    private readonly modelService: ModelService,
    private readonly fileService: FileService,
    private readonly llmService: LlmService,
    private readonly promptService: PromptService,
    private readonly promptInjectionService: PromptInjectionService,
  ) {}

  async check(dto: CheckReportDto) {
    const { checkPrev, groupId } = dto;

    const { reportsData, content, models, modelReview, task, lab } =
      await this.prepareCheckData(dto);

    const promises: Promise<CheckResult[]>[] = [];

    models.forEach((model) => {
      const checkPromises = reportsData.map((report) =>
        this.reportCheck.checkOneReport({
          report,
          task,
          content,
          model,
          groupId,
          checkPrev,
          labId: lab.id,
        }),
      );

      promises.push(Promise.all(checkPromises));
    });

    const resultPromises = await Promise.allSettled(promises);
    const reviewData = this.prepareMultipleData(resultPromises);
    const combinedResults = await this.combineCheckResults({
      reviewData,
      modelReview,
      task,
      content,
    });

    const checks = await this.reportCheck.createChecks(combinedResults, modelReview.id, lab.id);

    return checks;
  }

  async combineCheckResults(dto: CombineCheckResultsDto) {
    const { reviewData, modelReview, task, content } = dto;

    const promises = reviewData.map((data) =>
      this.combineCheckResult({ data, modelReview, task, content }),
    );

    const reviewResults = await Promise.all(promises);

    return reviewResults;
  }

  async combineCheckResult(data: CombineCheckResultDto) {
    const {
      data: { student, result, answer },
      modelReview,
      task,
      content,
    } = data;

    const studentStr = `${student.name} ${student.surname} ${student.middlename}`;
    const securityAnalysis = this.promptInjectionService.analyze(answer);

    this.logger.log(
      `Началось сведение ответов для студента [${studentStr}] моделью [${modelReview.name}]`,
    );

    const prompt = this.promptService.prepareMultiplePrompt({
      task,
      answer,
      checks: result,
      content,
      securityAnalysis,
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
    const checkedResult = this.promptInjectionService.mergeResultFields(
      resultDto,
      securityAnalysis,
    );

    this.promptInjectionService.assertGeneratedReviewAllowed(checkedResult);

    const finalResult: CheckResult = {
      ...checkedResult,
      student,
      model: modelReview,
      answer,
    };

    return finalResult;
  }

  prepareMultipleData(resultPromises: PromiseSettledResult<CheckResult[]>[]) {
    const reviewData: MultipleReviewDto[] = [];

    const results = resultPromises
      .filter((resultPromise) => resultPromise.status === 'fulfilled')
      .map((resultPromise) => resultPromise.value);

    for (let i = 0; i < results[0].length; i++) {
      const check: ModelCheckResultSummary[] = [];
      const answer: string = results[0][i].answer;

      for (const result of results) {
        check.push({
          modelName: result[i].model.name,
          review: result[i].review,
          grade: result[i].grade,
          advantages: result[i].advantages,
          disadvantages: result[i].disadvantages,
          promptInjectionDetected: result[i].promptInjectionDetected,
          promptInjectionRisk: result[i].promptInjectionRisk,
          promptInjectionFragments: result[i].promptInjectionFragments,
          securityComment: result[i].securityComment,
        });
      }

      reviewData.push({ student: results[0][i].student, result: check, answer });
    }

    return reviewData;
  }

  async prepareCheckData(dto: CheckReportDto) {
    const { labId, modelsId, studentsId } = dto;
    const reviewModelId = modelsId.at(-1);

    if (!reviewModelId) {
      throw new Error('Incorrect data');
    }

    const lab = await this.labService.findOne(labId, { course: { prompt: true } });
    const models = await this.modelService.findByIds(modelsId.slice(0, -1));
    const modelReview = await this.modelService.findOne(reviewModelId);

    const { content } = lab.course.prompt;
    const task = lab.content;

    const repData = await this.getReportsData(dto);
    const reportsData = studentsId.length
      ? repData.filter((rp) => studentsId.some((st) => isSimilarStudents(rp, st)))
      : repData;

    return { reportsData, content, models, modelReview, task, lab };
  }

  async getReportsData(dto: CheckReportDto) {
    const { reportsZip, reportFile, studentsId } = dto;

    if (reportsZip) {
      return this.fileService.parseArchive(reportsZip.buffer);
    }

    if (reportFile) {
      return this.fileService.parseSingleReport(reportFile, studentsId[0]);
    }

    throw new Error('Не переданы файлы отчета для проверки');
  }
}
