import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { GroupService } from './group.service';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateGroupDto } from './dto/create-group.dto';
import { Serialize } from 'src/common/decorators/serialize.decorator';
import { GroupDto } from './dto/group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@ApiTags('Group')
@Controller('groups')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Get('id')
  @Serialize(GroupDto)
  @ApiOkResponse({ type: GroupDto })
  @ApiBadRequestResponse({ description: 'Incorrect data' })
  @ApiNotFoundResponse({ description: 'Group not found' })
  findOne(@Param('id') id: number) {
    return this.groupService.findOne(id);
  }

  @Get()
  @Serialize(GroupDto)
  @ApiOkResponse({ type: [GroupDto] })
  findMany() {
    return this.groupService.findMany();
  }

  @Post()
  @Serialize(GroupDto)
  @ApiCreatedResponse({ type: GroupDto })
  @ApiBadRequestResponse({ description: 'Incorrect data' })
  create(@Body() createGroupDto: CreateGroupDto) {
    return this.groupService.create(createGroupDto);
  }

  @Patch('id')
  @Serialize(GroupDto)
  @ApiOkResponse({ type: GroupDto })
  @ApiBadRequestResponse({ description: 'Incorrect data' })
  @ApiNotFoundResponse({ description: 'Group not found' })
  update(@Param('id') id: number, @Body() updateGroupDto: UpdateGroupDto) {
    return this.groupService.update(id, updateGroupDto);
  }

  @Delete('id')
  @ApiOkResponse({ description: 'Group deleted' })
  @ApiBadRequestResponse({ description: 'Incorrect data' })
  @ApiNotFoundResponse({ description: 'Group not found' })
  delete(@Param('id') id: number) {
    return this.groupService.delete(id);
  }
}
