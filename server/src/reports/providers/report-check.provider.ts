import { Injectable, Logger } from '@nestjs/common';
import { CheckOneReportDto, FilterSuccessResultsDto, ProcessStudentDto } from '../reports.types';
import { NotificationService } from 'src/notification/notification.service';
import { PromptService } from 'src/prompt/prompt.service';
import { FileService } from 'src/file/file.service';
import { LlmService } from 'src/llm/llm.service';
import { CheckResultDto } from '../dto/check-result.dto';
import { CheckResult } from 'src/types/reports.types';
import { CheckService } from 'src/check/check.service';
import { StudentService } from 'src/student/student.service';
import { Check } from 'src/check/entities/check.entity';
import { isSimilarStudents } from '../reports.utils';

@Injectable()
export class ReportCheck {
  private readonly logger = new Logger(ReportCheck.name);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly promptService: PromptService,
    private readonly fileService: FileService,
    private readonly llmService: LlmService,
    private readonly checkService: CheckService,
    private readonly studentService: StudentService,
  ) {}

  async checkOneReport(data: CheckOneReportDto) {
    const { report, task, content, model, groupId, checkPrev, labId } = data;

    const { student, studentStr, studentFound } = await this.processStudent({ ...report, groupId });

    this.notificationService.reportOneStarted({
      student: studentStr,
      model: model.name,
      id: student.id,
      labId,
    });
    this.logger.log(`Начал провека отчета студента [${studentStr}] моделью [${model.name}]`);

    const basePrompt = this.promptService.preparePrompt(report.content, task, content);

    const prompt = await this.preparePrompt(basePrompt, checkPrev, studentFound?.id);

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

  async preparePrompt(prompt: string, usePrev?: boolean, stId?: number) {
    if (!usePrev || !stId) {
      return prompt;
    }

    const prevCheck = await this.checkService.findLastCheck(stId);

    if (!prevCheck) {
      return prompt;
    }

    const newPrompt = this.promptService.preparePrevPrompt({
      ...prevCheck,
      grade: String(prevCheck.grade),
      promptTxt: prompt,
    });

    return newPrompt;
  }

  async processStudent(data: ProcessStudentDto) {
    const { name, surname, middlename, groupId } = data;

    const studentStr = `${name} ${surname} ${middlename}`;
    const studentFound = await this.studentService.findRawStudent(name, surname, middlename);

    let student = studentFound;

    if (!student) {
      student = await this.studentService.create({ name, surname, middlename, groupId });
    }

    return { student, studentStr, studentFound };
  }

  async createChecks(results: CheckResult[], modelId: number, labId: number) {
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

  filterSuccessResults(dto: FilterSuccessResultsDto) {
    const { resultPromises, reportsData, modelName, labId } = dto;
    const results: CheckResult[] = [];

    for (const result of resultPromises) {
      if (result.status === 'fulfilled') {
        results.push(result.value);

        continue;
      }
    }

    if (!results.length && resultPromises[0].status === 'rejected') {
      throw new Error(resultPromises[0].reason);
    }

    for (const result of results) {
      if (!reportsData.some((rp) => isSimilarStudents(rp, result.student))) {
        const studentStr = `${result.student.name} ${result.student.surname} ${result.student.middlename}`;

        this.notificationService.reportOneFailed({
          student: studentStr,
          model: modelName,
          id: result.student.id,
          labId,
        });
      }
    }

    return results;
  }
}
