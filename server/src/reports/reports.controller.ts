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
import { CheckGrDto } from 'src/check/dto/check-gr.dto';
import { CheckReportMulDto } from './dto/check-report-mul.dto';
@ApiTags('Report')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @Serialize(CheckDto)
  @UseInterceptors(FileInterceptor('reportsZip'))
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({ type: [CheckDto] })
  uploadArchive(
    @Body() checkReportDto: CheckReportMulDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    checkReportDto.reportsZip = file;

    if (checkReportDto.modelsId.length >= 2) {
      return this.reportsService.checkReportByMultipleModels(checkReportDto);
    } else {
      return this.reportsService.checkReports({
        labId: checkReportDto.labId,
        modelId: checkReportDto.modelsId[0],
        reportsZip: checkReportDto.reportsZip,
        groupId: checkReportDto.groupId,
      });
    }
  }

  @Get('/lab-checks/:labId')
  @Serialize(CheckGrDto)
  @ApiNotFoundResponse({ description: 'Lab not found' })
  @ApiBadRequestResponse({ description: 'Incorrect data' })
  @ApiOkResponse({ type: [CheckGrDto] })
  async findLabChecks(@Param('labId') labId: number) {
    return this.reportsService.getLabChecks(labId);
  }
}
