import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CourseService } from './course.service';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Serialize } from 'src/common/decorators/serialize.decorator';
import { CourseDto } from './dto/course.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { LabDto } from 'src/lab/dto/lab.dto';
import { CoursePaginatedDto } from './dto/course-paginated.dto';
import { SearchCourseDto } from './dto/search-course.dto';
import { CourseSimpleDto } from './dto/course-simple.dto';

@ApiTags('Course')
@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get('/all')
  @Serialize(CourseSimpleDto)
  @ApiOkResponse({ type: [CourseSimpleDto] })
  findAll() {
    return this.courseService.findAllCourses();
  }

  @Get(':id/labs')
  @Serialize(LabDto)
  @ApiOkResponse({ type: LabDto })
  @ApiNotFoundResponse({ description: 'Course not found' })
  @ApiBadRequestResponse({ description: 'Incorrect data' })
  getLabs(@Param('id') id: number) {
    return this.courseService.getLabs(id);
  }

  @Get(':id')
  @Serialize(CourseDto)
  @ApiOkResponse({ type: CourseDto })
  @ApiNotFoundResponse({ description: 'Course not found' })
  @ApiBadRequestResponse({ description: 'Incorrect data' })
  findOne(@Param('id') id: number) {
    return this.courseService.findOne(id);
  }

  @Get()
  @ApiOkResponse({ type: CoursePaginatedDto })
  findMany(@Query() searchDto: SearchCourseDto) {
    return this.courseService.findMany(searchDto);
  }

  @Post()
  @Serialize(CourseDto)
  @ApiCreatedResponse({ type: CourseDto })
  @ApiBadRequestResponse({ description: 'Incorrect data' })
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.courseService.create(createCourseDto);
  }

  @Patch(':id')
  @Serialize(CourseDto)
  @ApiOkResponse({ type: CourseDto })
  @ApiNotFoundResponse({ description: 'Course not found' })
  @ApiBadRequestResponse({ description: 'Incorrect data' })
  update(@Param('id') id: number, @Body() updateCourseDto: UpdateCourseDto) {
    return this.courseService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Course deleted' })
  @ApiNotFoundResponse({ description: 'Course not found' })
  @ApiBadRequestResponse({ description: 'Incorrect data' })
  delete(@Param('id') id: number) {
    return this.courseService.delete(id);
  }
}
