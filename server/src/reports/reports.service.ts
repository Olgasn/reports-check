import { Injectable, Logger } from '@nestjs/common';
import { FileService } from 'src/file/file.service';
import { CheckService } from 'src/check/check.service';
import { PromptService } from 'src/prompt/prompt.service';
import { GetChecksDto } from 'src/check/dto/get-checks.dto';
import { NotificationService } from 'src/notification/notification.service';
import { CheckReportDto } from './dto/check-report.dto';
import { ReportStrategy } from './providers/report-strategy.provider';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    private readonly fileService: FileService,
    private readonly checkService: CheckService,
    private readonly promptService: PromptService,
    private readonly notificationService: NotificationService,
    private readonly reportStrategy: ReportStrategy,
  ) {}

  parseStudentsFile(zip: Express.Multer.File) {
    return this.fileService.parseStudentsFromFile(zip.buffer);
  }

  async getLabChecks(labId: number) {
    return this.checkService.getLabChecks(labId);
  }

  async getChecks(dto: GetChecksDto) {
    return this.checkService.getByIds(dto.ids);
  }

  handleCheckReports(dto: CheckReportDto) {
    const func = async () => {
      try {
        this.notificationService.checkStarted();

        const checkStrategy = this.reportStrategy.getStrategy(dto.modelsId.length);
        const results = await checkStrategy.check(dto);

        const ids = results.map((check) => check.id);

        this.notificationService.reportsChecked(ids, dto.labId);
      } catch (error: any) {
        this.notificationService.checkFailed(dto.labId, error?.message);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    setImmediate(func);
  }
}
