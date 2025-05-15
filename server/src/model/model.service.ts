import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, In, Repository } from 'typeorm';
import { Model } from './entities/model.entity';
import { KeyService } from 'src/key/key.service';
import { CreateModelDto } from './dto/create-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';
import { ProviderService } from 'src/provider/provider.service';
import { LlmInterfaces } from 'src/types/reports.types';

@Injectable()
export class ModelService {
  private readonly modelRepo: Repository<Model>;

  constructor(
    private readonly dataSource: DataSource,
    private readonly keyService: KeyService,
    private readonly providerService: ProviderService,
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

  createOllama(dto: CreateModelDto) {
    const { keyId, providerId } = dto;

    if (keyId || providerId) {
      throw new BadRequestException(`You can't set api key and provider for ollama interface`);
    }

    const modelPlain = this.modelRepo.create(dto);

    return this.modelRepo.save(modelPlain);
  }

  async createOpenAi(dto: CreateModelDto) {
    const { keyId, providerId } = dto;

    if (!keyId || !providerId) {
      throw new BadRequestException(
        'You should define both api key and provider for OpenAi interface',
      );
    }

    const modelPlain = this.modelRepo.create(dto);

    const key = await this.keyService.findOne(keyId);
    const provider = await this.providerService.findOne(providerId);

    modelPlain.key = key;
    modelPlain.provider = provider;

    return this.modelRepo.save(modelPlain);
  }

  create(dto: CreateModelDto) {
    switch (dto.llmInterface) {
      case LlmInterfaces.Ollama: {
        return this.createOllama(dto);
      }

      case LlmInterfaces.OpenAi: {
        return this.createOpenAi(dto);
      }
    }
  }

  async updateOllama(id: number, dto: UpdateModelDto) {
    const { keyId, providerId } = dto;

    if (keyId || providerId) {
      throw new BadRequestException(`You can't set api key and provider for ollama interface`);
    }

    const model = await this.findOne(id);

    Object.assign(model, dto);

    return this.modelRepo.save(model);
  }

  async updateOpenAi(id: number, dto: UpdateModelDto) {
    const { keyId, providerId } = dto;

    const model = await this.findOne(id);

    Object.assign(model, dto);

    if (keyId) {
      const key = await this.keyService.findOne(keyId);

      model.key = key;
    }

    if (providerId) {
      const provider = await this.providerService.findOne(providerId);

      model.provider = provider;
    }

    return this.modelRepo.save(model);
  }

  async update(id: number, dto: UpdateModelDto) {
    switch (dto.llmInterface) {
      case LlmInterfaces.Ollama: {
        return this.updateOllama(id, dto);
      }

      case LlmInterfaces.OpenAi: {
        return this.updateOpenAi(id, dto);
      }
    }
  }

  async delete(id: number) {
    const model = await this.findOne(id);

    await this.modelRepo.remove(model);
  }
}
