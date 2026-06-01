import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { StudentService } from './student.service';
import {
  ApiConsumes,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Serialize } from 'src/common/decorators/serialize.decorator';
import { StudentDto } from './dto/student.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImportStudentsCsvDto, ImportStudentsCsvResultDto } from './dto/import-students-csv.dto';

@ApiTags('Student')
@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get(':id')
  @Serialize(StudentDto)
  @ApiOkResponse({ type: StudentDto })
  @ApiNotFoundResponse({ description: 'Student not found' })
  @ApiBadRequestResponse({ description: 'Incorrect data' })
  findOne(@Param('id') id: number) {
    return this.studentService.findOne(id);
  }

  @Get()
  @Serialize(StudentDto)
  @ApiOkResponse({ type: [StudentDto] })
  findMany() {
    return this.studentService.findMany();
  }

  @Post()
  @Serialize(StudentDto)
  @ApiCreatedResponse({ type: StudentDto })
  @ApiNotFoundResponse({ description: 'Group not found' })
  @ApiBadRequestResponse({ description: 'Incorrect data' })
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentService.create(createStudentDto);
  }

  @Post('/import-csv')
  @UseInterceptors(FileInterceptor('csvFile'))
  @ApiConsumes('multipart/form-data')
  @ApiCreatedResponse({ type: ImportStudentsCsvResultDto })
  @ApiBadRequestResponse({ description: 'Incorrect data' })
  importCsv(
    @Body() importStudentsCsvDto: ImportStudentsCsvDto,
    @UploadedFile() csvFile: Express.Multer.File,
  ) {
    importStudentsCsvDto.csvFile = csvFile;

    return this.studentService.importFromCsv(importStudentsCsvDto.csvFile);
  }

  @Patch(':id')
  @Serialize(StudentDto)
  @ApiOkResponse({ type: StudentDto })
  @ApiNotFoundResponse({ description: 'Group | Student not found' })
  @ApiBadRequestResponse({ description: 'Incorrect data' })
  update(@Param('id') id: number, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentService.update(id, updateStudentDto);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Student deleted' })
  @ApiNotFoundResponse({ description: 'Student not found' })
  @ApiBadRequestResponse({ description: 'Incorrect data' })
  delete(@Param('id') id: number) {
    return this.studentService.delete(id);
  }
}
