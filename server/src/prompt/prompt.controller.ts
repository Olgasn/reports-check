import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { PromptService } from './prompt.service';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PromptDto } from './dto/prompt.dto';
import { CreatePromptDto } from './dto/create-prompt.dto';
import { UpdatePromptDto } from './dto/update-promt.dto';
import { Serialize } from 'src/common/decorators/serialize.decorator';

@ApiTags('Prompt')
@Controller('prompts')
export class PromptController {
  constructor(private readonly promptService: PromptService) {}

  @Get(':id')
  @Serialize(PromptDto)
  @ApiOkResponse({ type: PromptDto })
  @ApiNotFoundResponse({ description: 'Prompt not found' })
  @ApiBadRequestResponse({ description: 'Incorrect data' })
  findOne(@Param('id') id: number) {
    return this.promptService.findOne(id);
  }

  @Get()
  @Serialize(PromptDto)
  @ApiOkResponse({ type: [PromptDto] })
  findMany() {
    return this.promptService.findMany();
  }

  @Post()
  @Serialize(PromptDto)
  @ApiCreatedResponse({ type: PromptDto })
  @ApiBadRequestResponse({ description: 'Incorrect data' })
  create(@Body() createPromptDto: CreatePromptDto) {
    return this.promptService.create(createPromptDto);
  }

  @Patch(':id')
  @Serialize(PromptDto)
  @ApiOkResponse({ type: PromptDto })
  @ApiNotFoundResponse({ description: 'Prompt not found' })
  @ApiBadRequestResponse({ description: 'Incorrect data' })
  update(@Param('id') id: number, @Body() updatePromptDto: UpdatePromptDto) {
    return this.promptService.update(id, updatePromptDto);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Prompt deleted' })
  @ApiNotFoundResponse({ description: 'Prompt not found' })
  @ApiBadRequestResponse({ description: 'Incorrect data' })
  delete(@Param('id') id: number) {
    return this.promptService.delete(id);
  }
}
