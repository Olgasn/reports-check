import { Body, Controller, Get, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Serialize } from 'src/common/decorators/serialize.decorator';
import { CheckDto } from 'src/check/dto/check.dto';
import { CheckReportDto } from './dto/check-report.dto';
@ApiTags('Report')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @Serialize(CheckDto)
  @UseInterceptors(FileInterceptor('reportsZip'))
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({ type: [CheckDto] })
  async uploadArchive(
    @Body() checkReportDto: CheckReportDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    checkReportDto.reportsZip = file;

    return this.reportsService.checkReports(checkReportDto);
  }

  @Get('/lab-checks/:labId')
  @Serialize(CheckDto)
  @ApiNotFoundResponse({ description: 'Lab not found' })
  @ApiBadRequestResponse({ description: 'Incorrect data' })
  @ApiOkResponse({ type: [CheckDto] })
  async findLabChecks(@Param('labId') labId: number) {
    return this.reportsService.getLabChecks(labId);
  }
}
