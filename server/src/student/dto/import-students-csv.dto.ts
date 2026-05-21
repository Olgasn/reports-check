import { ApiProperty } from '@nestjs/swagger';

export class ImportStudentsCsvDto {
  @ApiProperty({ type: 'string', format: 'binary', required: true })
  csvFile: Express.Multer.File;
}

export class ImportStudentsCsvResultDto {
  @ApiProperty()
  totalRows: number;

  @ApiProperty()
  createdStudents: number;

  @ApiProperty()
  duplicateStudents: number;

  @ApiProperty()
  createdGroups: number;

  @ApiProperty()
  skippedRows: number;
}
