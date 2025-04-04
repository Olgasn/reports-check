import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Group } from './entities/group.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupService {
  private readonly groupRepo: Repository<Group>;

  constructor(private readonly dataSource: DataSource) {
    this.groupRepo = this.dataSource.getRepository(Group);
  }

  async findOne(id: number) {
    const group = await this.groupRepo.findOne({ where: { id } });

    if (!group) {
      throw new NotFoundException('Группа не была найдена.');
    }

    return group;
  }

  findMany() {
    return this.groupRepo.find();
  }

  create(createGroupDto: CreateGroupDto) {
    const groupPlain = this.groupRepo.create(createGroupDto);

    return this.groupRepo.save(groupPlain);
  }

  async update(id: number, updateGroupDto: UpdateGroupDto) {
    const group = await this.findOne(id);

    Object.assign(group, updateGroupDto);

    return this.groupRepo.save(group);
  }

  async delete(id: number) {
    const group = await this.findOne(id);

    await this.groupRepo.remove(group);
  }
}
