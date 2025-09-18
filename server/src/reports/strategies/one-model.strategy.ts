import { Check } from 'src/check/entities/check.entity';
import { CheckReportDto } from '../dto/check-report.dto';
import { ReportStrategy } from './report-strategy.interface';
import { Injectable } from '@nestjs/common';
import { ReportCheck } from '../providers/report-check.provider';
import { LabService } from 'src/lab/lab.service';
import { ModelService } from 'src/model/model.service';
import { FileService } from 'src/file/file.service';
import { isSimilarStudents } from '../reports.utils';

@Injectable()
export class OneModelStrategy implements ReportStrategy {
  constructor(
    private readonly reportCheck: ReportCheck,
    private readonly labService: LabService,
    private readonly modelService: ModelService,
    private readonly fileService: FileService,
  ) {}

  async check(dto: CheckReportDto): Promise<Check[]> {
    const { groupId, checkPrev } = dto;
    const { lab, reportsData, task, content, model } = await this.prepareCheckData(dto);

    const promises = reportsData.map((report) => {
      const checkData = {
        report,
        task,
        content,
        model,
        groupId,
        checkPrev,
        labId: lab.id,
      };

      return this.reportCheck.checkOneReport(checkData);
    });

    const resultPromises = await Promise.allSettled(promises);
    const results = this.reportCheck.filterSuccessResults({
      resultPromises,
      modelName: model.name,
      labId: lab.id,
      reportsData,
    });

    const checks = await this.reportCheck.createChecks(results, model.id, lab.id);

    return checks;
  }

  async prepareCheckData(dto: CheckReportDto) {
    const { labId, modelsId, reportsZip, studentsId } = dto;
    const modelId = modelsId[0];

    if (!modelId) {
      throw new Error('No model');
    }

    const lab = await this.labService.findOne(labId, { course: { prompt: true } });
    const model = await this.modelService.findOne(modelId);

    const { content } = lab.course.prompt;
    const task = lab.content;
    const repData = await this.fileService.parseArchive(reportsZip.buffer);

    const reportsData = studentsId.length
      ? repData.filter((rp) => studentsId.some((st) => isSimilarStudents(rp, st)))
      : repData;

    return { model, content, task, lab, reportsData };
  }
}
