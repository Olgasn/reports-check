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
import { GetChecksDto } from 'src/check/dto/get-checks.dto';
import { StudentParseDto, StudentsParsedDto } from './dto/students-parsed.dto';
import { CheckReportDto } from './dto/check-report.dto';

@ApiTags('Report')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('/parse-from-file')
  @Serialize(StudentsParsedDto)
  @UseInterceptors(FileInterceptor('reportsZip'))
  @ApiConsumes('multipart/form-data')
  parseStudentsFromArchive(
    @Body() parseStudentsDto: StudentParseDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.reportsService.parseStudentsFile(file);
  }

  @Post()
  @Serialize(CheckDto)
  @UseInterceptors(FileInterceptor('reportsZip'))
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({ type: [CheckDto] })
  uploadArchive(@Body() checkReportDto: CheckReportDto, @UploadedFile() file: Express.Multer.File) {
    checkReportDto.reportsZip = file;

    this.reportsService.handleCheckReports(checkReportDto);

    return { message: 'Проверка началась' };
  }

  @Get('/lab-checks/:labId')
  @Serialize(CheckGrDto)
  @ApiNotFoundResponse({ description: 'Lab not found' })
  @ApiBadRequestResponse({ description: 'Incorrect data' })
  @ApiOkResponse({ type: [CheckGrDto] })
  async findLabChecks(@Param('labId') labId: number) {
    return this.reportsService.getLabChecks(labId);
  }

  @Post('/checks')
  @Serialize(CheckDto)
  async getChecks(@Body() dto: GetChecksDto) {
    return this.reportsService.getChecks(dto);
  }
}
