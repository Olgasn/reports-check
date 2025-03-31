import { Injectable } from '@nestjs/common';
import { CheckReportDto } from './dto/check-report.dto';
import { FileService } from 'src/file/file.service';
import * as path from 'path';

@Injectable()
export class ReportsService {
  constructor(private readonly fileService: FileService) {}

  async parseStudentsFiles(checkReportDto: CheckReportDto) {
    const { reportsZip, task } = checkReportDto;
    const reportsData = await this.fileService.parseArchive(reportsZip.buffer);
    const folder = `check/reports_check_${Date.now()}`;

    for (const data of reportsData) {
      this.fileService.writeFile({
        name: `${data.name} ${data.surname} ${data.middlename}_${data.num}.txt`,
        content: data.content,
        folder: path.join(folder, 'reports'),
      });
    }

    const taskTxt = await this.fileService.parseFile(task.originalname, task.buffer);

    this.fileService.writeFile({
      name: `task.txt`,
      content: taskTxt,
      folder,
    });
  }
}
