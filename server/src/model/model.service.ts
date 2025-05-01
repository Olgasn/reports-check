import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, In, Repository } from 'typeorm';
import { Model } from './entities/model.entity';
import { KeyService } from 'src/key/key.service';
import { CreateModelDto } from './dto/create-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';
import { Providers } from 'src/types/reports.types';

@Injectable()
export class ModelService {
  private readonly modelRepo: Repository<Model>;

  constructor(
    private readonly dataSource: DataSource,
    private readonly keyService: KeyService,
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
      },
    });

    return models;
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
    const { name, value, keyId, top_p, temperature, max_tokens, provider } = createModelDto;
    const modelPlain = this.modelRepo.create({
      name,
      value,
      top_p,
      temperature,
      max_tokens,
      provider,
    });

    if (!keyId && provider === Providers.OpenRouter) {
      throw new BadRequestException('Для OpenRouter модели вы должны задать ключ API.');
    }

    if (keyId) {
      const key = await this.keyService.findOne(keyId);

      modelPlain.key = key;
    }

    return this.modelRepo.save(modelPlain);
  }

  async update(id: number, updateModelDto: UpdateModelDto) {
    const { name, value, keyId, top_p, temperature, max_tokens, provider } = updateModelDto;
    const model = await this.findOne(id);

    Object.assign(model, { name, value, top_p, temperature, max_tokens, provider });

    if (!keyId && provider === Providers.OpenRouter) {
      throw new BadRequestException('Для OpenRouter модели вы должны задать ключ API.');
    }

    if (keyId) {
      const key = await this.keyService.findOne(keyId);

      model.key = key;
    }

    return this.modelRepo.save(model);
  }

  async delete(id: number) {
    const model = await this.findOne(id);

    await this.modelRepo.remove(model);
  }
}
