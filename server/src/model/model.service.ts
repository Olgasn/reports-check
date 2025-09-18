import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, In, Repository } from 'typeorm';
import { Model } from './entities/model.entity';
import { CreateModelDto } from './dto/create-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';
import { ModelFabric } from './providers/model.fabric';

@Injectable()
export class ModelService {
  private readonly modelRepo: Repository<Model>;

  constructor(
    private readonly dataSource: DataSource,
    private readonly modelFabric: ModelFabric,
  ) {
    this.modelRepo = this.dataSource.getRepository(Model);
  }

  async findByIds(ids: number[]) {
    const models = await this.modelRepo.find({
      where: {
        id: In(ids),
      },
      relations: {
        key: true,
        provider: true,
      },
    });

    return models;
  }

  async findOne(id: number) {
    const model = await this.modelRepo.findOne({
      where: { id },
      relations: {
        key: true,
        provider: true,
      },
    });

    if (!model) {
      throw new NotFoundException('Model not found');
    }

    return model;
  }

  findMany() {
    return this.modelRepo.find({ relations: { key: true, provider: true } });
  }

  create(dto: CreateModelDto) {
    const handler = this.modelFabric.create(dto.llmInterface);

    return handler.create(dto);
  }

  async update(id: number, dto: UpdateModelDto) {
    const model = await this.findOne(id);
    const handler = this.modelFabric.create(dto.llmInterface);

    return handler.update(model, dto);
  }

  async delete(id: number) {
    const model = await this.findOne(id);

    await this.modelRepo.remove(model);
  }
}
