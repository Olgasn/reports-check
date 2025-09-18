import { CreateModelDto } from 'src/model/dto/create-model.dto';
import { UpdateModelDto } from 'src/model/dto/update-model.dto';
import { Model } from 'src/model/entities/model.entity';
import { IModelHandler } from '../model.handler';
import { DataSource, Repository } from 'typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class OllamaHandler implements IModelHandler {
  private readonly modelRepo: Repository<Model>;

  constructor(dataSource: DataSource) {
    this.modelRepo = dataSource.getRepository(Model);
  }

  create(dto: CreateModelDto) {
    const { keyId, providerId } = dto;

    if (keyId || providerId) {
      throw new BadRequestException(`You can't set api key and provider for ollama interface`);
    }

    const modelPlain = this.modelRepo.create(dto);

    return this.modelRepo.save(modelPlain);
  }

  update(model: Model, dto: UpdateModelDto) {
    const { keyId, providerId } = dto;

    if (keyId || providerId) {
      throw new BadRequestException(`You can't set api key and provider for ollama interface`);
    }

    Object.assign(model, dto);

    return this.modelRepo.save(model);
  }
}
