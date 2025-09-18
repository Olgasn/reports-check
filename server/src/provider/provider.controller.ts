import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ProviderService } from './provider.service';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProviderDto } from './dto/provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { CreateProviderDto } from './dto/create-provider.dto';
import { Serialize } from 'src/common/decorators/serialize.decorator';

@ApiTags('Provider')
@Controller('providers')
export class ProviderController {
  constructor(private readonly providerService: ProviderService) {}

  @Get(':id')
  @Serialize(ProviderDto)
  @ApiOkResponse({ type: ProviderDto })
  @ApiNotFoundResponse({ description: 'Provider not found' })
  @ApiBadRequestResponse({ description: 'Incorrect data' })
  findOne(@Param('id') id: number) {
    return this.providerService.findOne(id);
  }

  @Get()
  @Serialize(ProviderDto)
  @ApiOkResponse({ type: [ProviderDto] })
  findMany() {
    return this.providerService.findMany();
  }

  @Post()
  @Serialize(ProviderDto)
  @ApiCreatedResponse({ type: ProviderDto })
  @ApiNotFoundResponse({ description: 'Provider not found' })
  @ApiBadRequestResponse({ description: 'Incorrect data' })
  create(@Body() dto: CreateProviderDto) {
    return this.providerService.create(dto);
  }

  @Patch(':id')
  @Serialize(ProviderDto)
  @ApiOkResponse({ type: ProviderDto })
  @ApiNotFoundResponse({ description: 'Provider not found' })
  @ApiBadRequestResponse({ description: 'Incorrect data' })
  update(@Param('id') id: number, @Body() dto: UpdateProviderDto) {
    return this.providerService.update(id, dto);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Provider deleted' })
  @ApiNotFoundResponse({ description: 'Provider not found' })
  @ApiBadRequestResponse({ description: 'Incorrect data' })
  delete(@Param('id') id: number) {
    return this.providerService.delete(id);
  }
}
