import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Model } from './entities/model.entity';
import { KeyService } from 'src/key/key.service';
import { CreateModelDto } from './dto/create-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';

@Injectable()
export class ModelService {
  private readonly modelRepo: Repository<Model>;

  constructor(
    private readonly dataSource: DataSource,
    private readonly keyService: KeyService,
  ) {
    this.modelRepo = this.dataSource.getRepository(Model);
  }

  async findOne(id: number) {
    const model = await this.modelRepo.findOne({
      where: { id },
      relations: {
        key: true,
      },
    });

    if (!model) {
      throw new NotFoundException('Модель не была найдена.');
    }

    return model;
  }

  findMany() {
    return this.modelRepo.find({ relations: { key: true } });
  }

  async create(createModelDto: CreateModelDto) {
    const { name, value, keyId } = createModelDto;
    const key = await this.keyService.findOne(keyId);
    const modelPlain = this.modelRepo.create({ key, name, value });

    return this.modelRepo.save(modelPlain);
  }

  async update(id: number, updateModelDto: UpdateModelDto) {
    const { name, value, keyId } = updateModelDto;
    const model = await this.findOne(id);

    Object.assign(model, { name, value });

    if (keyId) {
      const key = await this.keyService.findOne(id);

      model.key = key;
    }

    return this.modelRepo.save(model);
  }

  async delete(id: number) {
    const model = await this.findOne(id);

    await this.modelRepo.remove(model);
  }
}
