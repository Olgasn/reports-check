import { Injectable, Logger } from '@nestjs/common';
import { CheckReportDto } from './dto/check-report.dto';
import { FileService } from 'src/file/file.service';
import * as path from 'path';
import { LlmService } from 'src/llm/llm.service';
import { ModelService } from 'src/model/model.service';
import { CheckResultDto } from './dto/check-result.dto';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    private readonly fileService: FileService,
    private readonly llmService: LlmService,
    private readonly modelService: ModelService,
  ) {}

  preparePromt(task: string, answer: string) {
    return `
      Вы преподаватель в университете и эксперт по базам данных и системам управления базами данных, информационным системам и разработке программных приложений для них.
      Вы выдали студенту задание для выполнение лабораторной работы по учебной дисциплине "Базы данных"
      Задание на лабораторную работу: ${task}
      Отчет студента на задание по лабораторной работе: ${answer}   
      Оцени предоставленный студентом отчет по лабораторной работе на: соответствие выполненного задания исходному заданию с учетом варанта студента, правильность и полноту выполнения задания. 
      Выставь оценку отчету студента по шкале от 1 до 10. Оценка ниже 4 выставляется в случае несоответствия варианту или выполнения не всех пунктов задания.
      Напиши отзыв на выполненную работу.
      В ответе должен быть русский язык.
      Тебе нужно представить ответ в таком виде (ОБЯЗАТЕЛЬНО). Именно обернуть в тег, чтобы я мог его правильно распарсить.
      Данный ответ как бы представляет собой json. Он должен быть корректен, иначе будет ошибка.
      <JSON>
      {
        "grade": //оценка от 1 до 10,
        "review": //отзыв на ответ,
        "advantages": [] //положительные стороны ответа,
        "disadvantages": [] //отрицательные стороны ответа
      }
      </JSON>
    `;
  }

  async parseStudentsFiles(checkReportDto: CheckReportDto) {
    const model = await this.modelService.findOne(checkReportDto.modelId);

    const { reportsZip, task } = checkReportDto;

    const folder = `check/reports_check_${Date.now()}`;

    const reportsData = await this.fileService.parseArchive(reportsZip.buffer);
    const taskTxt = await this.fileService.parseFile(task.originalname, task.buffer);

    const promises = reportsData.map(async (report) => {
      const student = `${report.name} ${report.surname} ${report.middlename}`;

      this.logger.log(`Началась проверка отчета студента [${student}]`);

      const prompt = this.preparePromt(taskTxt, report.content);

      const result = await this.llmService.query(prompt, model.value, model.key.value);

      this.fileService.writeFile({
        name: `${model.name}_${student}_${Date.now()}.txt`,
        content: result,
        folder: 'llms',
      });

      this.logger.log(`Отчет студента [${student}] был проверен`);

      const dto = await this.llmService.extractData(CheckResultDto, result);

      dto.student = student;
      dto.num = report.num;

      this.fileService.writeFile({
        name: `${student}_${report.num}.txt`,
        content: report.content,
        folder: path.join(folder, 'reports'),
      });

      this.fileService.writeFile({
        name: `${student}_${report.num}.txt`,
        content: JSON.stringify(dto, null, 2),
        folder: path.join(folder, 'answers'),
      });

      return dto;
    });

    const results = await Promise.allSettled(promises);

    this.fileService.writeFile({
      name: `task.txt`,
      content: taskTxt,
      folder,
    });

    return results.filter((res) => res.status === 'fulfilled').map((data) => data.value);
  }
}
