import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { LabService } from './lab.service';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LabDto } from './dto/lab.dto';
import { CreateLabDto } from './dto/create-lab.dto';
import { UpdateLabDto } from './dto/update-course.dto';
import { Serialize } from 'src/common/decorators/serialize.decorator';

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
    return this.labService.findOne(id);
  }

  @Get()
  @Serialize(LabDto)
  @ApiOkResponse({ type: [LabDto] })
  findMany() {
    return this.labService.findMany();
  }

  @Post()
  @Serialize(LabDto)
  @ApiCreatedResponse({ type: LabDto })
  @ApiBadRequestResponse({ description: 'Incorrect data' })
  create(@Body() createLabDto: CreateLabDto) {
    return this.labService.create(createLabDto);
  }

  @Patch(':id')
  @Serialize(LabDto)
  @ApiOkResponse({ type: LabDto })
  @ApiNotFoundResponse({ description: 'Lab not found' })
  @ApiBadRequestResponse({ description: 'Incorrect data' })
  update(@Param('id') id: number, @Body() updateLabDto: UpdateLabDto) {
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
