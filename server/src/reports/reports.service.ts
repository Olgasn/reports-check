import { Injectable, Logger } from '@nestjs/common';
import { CheckReportDto } from './dto/check-report.dto';
import { FileService } from 'src/file/file.service';
import { LlmService } from 'src/llm/llm.service';
import { ModelService } from 'src/model/model.service';
import { CheckResultDto } from './dto/check-result.dto';
import { CheckService } from 'src/check/check.service';
import { LabService } from 'src/lab/lab.service';
import { StudentService } from 'src/student/student.service';
import { PromptService } from 'src/prompt/prompt.service';

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
  ) {}

  async getLabChecks(labId: number) {
    return this.checkService.findByLabs(labId);
  }

  async checkReports(checkReportDto: CheckReportDto) {
    const { labId, modelId, reportsZip } = checkReportDto;

    const lab = await this.labService.findOne(labId, { course: { prompt: true } });
    const model = await this.modelService.findOne(modelId);

    const { content } = lab.course.prompt;
    const task = lab.content;

    const reportsData = await this.fileService.parseArchive(reportsZip.buffer);

    const promises = reportsData.map(async (report) => {
      const studentStr = `${report.name} ${report.surname} ${report.middlename}`;

      const studentFound = await this.studentService.findByNum(report.num);

      this.logger.log(`Начал провека отчета студента [${studentStr}]`);

      const prompt = this.promptService.preparePrompt(report.content, task, content);
      const result = await this.llmService.query(prompt, model);

      this.fileService.writeFile({
        name: `${Date.now()}_model_${model.name}.txt`,
        folder: 'models_logs',
        content: result,
      });

      this.logger.log(`Отчет студента [${studentStr}] был проверен`);

      const resultDto = await this.llmService.extractData(CheckResultDto, result);

      let student = studentFound;

      if (!student) {
        const { name, surname, middlename, num } = report;

        student = await this.studentService.create({ name, surname, middlename, num });
      }

      const check = await this.checkService.create({
        studentId: student.id,
        labId,
        modelId,
        advantages: resultDto.advantages.join('\n'),
        disadvantages: resultDto.disadvantages.join('\n'),
        grade: resultDto.grade,
        review: resultDto.review,
        report: report.content,
      });

      return check;
    });

    const results = await Promise.allSettled(promises);

    return results
      .filter((pr) => pr.status === 'fulfilled')
      .map((pr) => pr.value)
      .filter((pr) => !!pr);
  }
}
