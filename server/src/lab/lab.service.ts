import { Injectable, NotFoundException } from '@nestjs/common';
import { Lab } from './entities/lab.entities';
import { CreateLabDto } from './dto/create-lab.dto';
import { UpdateLabDto } from './dto/update-course.dto';
import { Repository, DataSource } from 'typeorm';

@Injectable()
export class LabService {
  private readonly labRepo: Repository<Lab>;

  constructor(private readonly dataSource: DataSource) {
    this.labRepo = this.dataSource.getRepository(Lab);
  }

  async findOne(id: number) {
    const lab = await this.labRepo.findOne({ where: { id } });

    if (!lab) {
      throw new NotFoundException('Лабораторная не была найден.');
    }

    return lab;
  }

  findMany() {
    return this.labRepo.find();
  }

  create(createLabDto: CreateLabDto) {
    const labPlain = this.labRepo.create(createLabDto);

    return this.labRepo.save(labPlain);
  }

  async update(id: number, updateLabDto: UpdateLabDto) {
    const lab = await this.findOne(id);

    Object.assign(lab, updateLabDto);

    return this.labRepo.save(lab);
  }

  async delete(id: number) {
    const lab = await this.findOne(id);

    await this.labRepo.remove(lab);
  }
}
