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
import { LabService } from './lab.service';
import {
  ApiBadRequestResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LabDto } from './dto/lab.dto';
import { CreateLabDto } from './dto/create-lab.dto';
import { UpdateLabDto } from './dto/update-course.dto';
import { Serialize } from 'src/common/decorators/serialize.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Lab')
@Controller('labs')
export class LabController {
  constructor(private readonly labService: LabService) {}

  @Get(':id')
  @Serialize(LabDto)
  @ApiOkResponse({ type: LabDto })
  @ApiNotFoundResponse({ description: 'Lab not found' })
  @ApiBadRequestResponse({ description: 'Incorrect data' })
  findOne(@Param('id') id: number) {
    return this.labService.findOne(id, { course: true });
  }

  @Get()
  @Serialize(LabDto)
  @ApiOkResponse({ type: [LabDto] })
  findMany() {
    return this.labService.findMany();
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('task'))
  @Serialize(LabDto)
  @ApiCreatedResponse({ type: LabDto })
  @ApiBadRequestResponse({ description: 'Incorrect data' })
  create(@Body() createLabDto: CreateLabDto, @UploadedFile() task: Express.Multer.File) {
    createLabDto.task = task;

    return this.labService.create(createLabDto);
  }

  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('task'))
  @Serialize(LabDto)
  @ApiOkResponse({ type: LabDto })
  @ApiNotFoundResponse({ description: 'Lab not found' })
  @ApiBadRequestResponse({ description: 'Incorrect data' })
  update(
    @Param('id') id: number,
    @Body() updateLabDto: UpdateLabDto,
    @UploadedFile() task: Express.Multer.File,
  ) {
    updateLabDto.task = task;

    return this.labService.update(id, updateLabDto);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Lab deleted' })
  @ApiNotFoundResponse({ description: 'Lab not found' })
  @ApiBadRequestResponse({ description: 'Incorrect data' })
  delete(@Param('id') id: number) {
    return this.labService.delete(id);
  }
}
