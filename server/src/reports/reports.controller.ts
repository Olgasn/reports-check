import { Body, Controller, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CheckReportDto } from './dto/check-report.dto';
@ApiTags('Report')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @UseInterceptors(FileFieldsInterceptor([{ name: 'reportsZip' }, { name: 'task' }]))
  @ApiConsumes('multipart/form-data')
  async uploadArchive(
    @Body() checkReportDto: CheckReportDto,
    @UploadedFiles()
    files: {
      reportsZip: Express.Multer.File[];
      task: Express.Multer.File[];
    },
  ) {
    checkReportDto.reportsZip = files.reportsZip[0];
    checkReportDto.task = files.task[0];

    await this.reportsService.parseStudentsFiles(checkReportDto);
  }
}
