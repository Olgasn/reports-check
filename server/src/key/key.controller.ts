import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { KeyService } from './key.service';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Serialize } from 'src/common/decorators/serialize.decorator';
import { KeyDto } from './dto/key.dto';
import { CreateKeyDto } from './dto/create-key.dto';
import { UpdateKeyDto } from './dto/update-key.dto';

@ApiTags('Key')
@Controller('keys')
export class KeyController {
  constructor(private readonly keyService: KeyService) {}

  @Get(':id')
  @Serialize(KeyDto)
  @ApiOkResponse({ type: KeyDto })
  @ApiBadRequestResponse({ description: 'Incorrect data' })
  @ApiNotFoundResponse({ description: 'Not found' })
  findOne(@Param('id') id: number) {
    return this.keyService.findOne(id);
  }

  @Get()
  @Serialize(KeyDto)
  @ApiOkResponse({ type: [KeyDto] })
  findMany() {
    return this.keyService.findMany();
  }

  @Post()
  @Serialize(KeyDto)
  @ApiCreatedResponse({ type: KeyDto })
  @ApiBadRequestResponse({ description: 'Incorrect data' })
  create(@Body() createKeyDto: CreateKeyDto) {
    return this.keyService.create(createKeyDto);
  }

  @Patch(':id')
  @Serialize(KeyDto)
  @ApiOkResponse({ type: KeyDto })
  @ApiNotFoundResponse({ description: 'Not found' })
  @ApiBadRequestResponse({ description: 'Incorrect data' })
  update(@Param('id') id: number, @Body() updateKeyDto: UpdateKeyDto) {
    return this.keyService.update(id, updateKeyDto);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Deleted' })
  @ApiNotFoundResponse({ description: 'Not found' })
  delete(@Param('id') id: number) {
    return this.keyService.delete(id);
  }
}
