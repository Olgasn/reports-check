import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
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
import { GroupOpDto } from './dto/group-op.dto';
import { StudentsSearchDto } from 'src/student/dto/students-search.dto';
import { StudentsPaginatedDto } from 'src/student/dto/students-paginated.dto';

@ApiTags('Group')
@Controller('groups')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Get('/search-students')
  @ApiOkResponse({ type: [StudentsPaginatedDto] })
  @ApiNotFoundResponse({ description: 'Group not found' })
  @ApiBadRequestResponse({ description: 'Incorrect data' })
  getStudents(@Query() searchDto: StudentsSearchDto) {
    return this.groupService.getGroupStudents(searchDto);
  }

  @Get(':id')
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

  @Patch(':id')
  @Serialize(GroupDto)
  @ApiOkResponse({ type: GroupDto })
  @ApiBadRequestResponse({ description: 'Incorrect data' })
  @ApiNotFoundResponse({ description: 'Group not found' })
  update(@Param('id') id: number, @Body() updateGroupDto: UpdateGroupDto) {
    return this.groupService.update(id, updateGroupDto);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Group deleted' })
  @ApiBadRequestResponse({ description: 'Incorrect data' })
  @ApiNotFoundResponse({ description: 'Group not found' })
  delete(@Param('id') id: number) {
    return this.groupService.delete(id);
  }

  @Put(':groupId/add-student/:studentId')
  @ApiOkResponse({ description: 'Student added' })
  @ApiNotFoundResponse({ description: 'Student | Group not found' })
  @ApiBadRequestResponse({ description: 'Incorrect data' })
  addStudent(@Param('groupId') groupId: number, @Param('studentId') studentId: number) {
    const groupOpDto = new GroupOpDto();

    groupOpDto.groupId = groupId;
    groupOpDto.studentId = studentId;

    return this.groupService.addMember(groupOpDto);
  }

  @Put(':groupId/delete-student/:studentId')
  @ApiOkResponse({ description: 'Student added' })
  @ApiNotFoundResponse({ description: 'Student | Group not found' })
  @ApiBadRequestResponse({ description: 'Incorrect data' })
  deleteStudent(@Param('groupId') groupId: number, @Param('studentId') studentId: number) {
    const groupOpDto = new GroupOpDto();

    groupOpDto.groupId = groupId;
    groupOpDto.studentId = studentId;

    return this.groupService.removeMember(groupOpDto);
  }
}
