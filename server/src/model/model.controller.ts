import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ModelService } from './model.service';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ModelDto } from './dto/model.dto';
import { Serialize } from 'src/common/decorators/serialize.decorator';
import { CreateModelDto } from './dto/create-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';

@ApiTags('Model')
@Controller('models')
export class ModelController {
  constructor(private readonly modelService: ModelService) {}

  @Get(':id')
  @Serialize(ModelDto)
  @ApiOkResponse({ type: ModelDto })
  @ApiNotFoundResponse({ description: 'Not found' })
  @ApiBadRequestResponse({ description: 'Incorrect data' })
  findOne(@Param('id') id: number) {
    return this.modelService.findOne(id);
  }

  @Get()
  @Serialize(ModelDto)
  @ApiOkResponse({ type: [ModelDto] })
  findMany() {
    return this.modelService.findMany();
  }

  @Post()
  @Serialize(ModelDto)
  @ApiCreatedResponse({ type: ModelDto })
  @ApiBadRequestResponse({ description: 'Incorrect data' })
  @ApiNotFoundResponse({ description: 'Key not found' })
  create(@Body() createModelDto: CreateModelDto) {
    return this.modelService.create(createModelDto);
  }

  @Patch(':id')
  @Serialize(ModelDto)
  @ApiOkResponse({ type: ModelDto })
  @ApiBadRequestResponse({ description: 'Incorrect data' })
  @ApiNotFoundResponse({ description: 'Model | Key not found' })
  update(@Param('id') id: number, @Body() updateModelDto: UpdateModelDto) {
    return this.modelService.update(id, updateModelDto);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Model deleted' })
  @ApiNotFoundResponse({ description: 'Model not found' })
  @ApiBadRequestResponse({ description: 'Incorrect data' })
  delete(@Param('id') id: number) {
    return this.modelService.delete(id);
  }
}
