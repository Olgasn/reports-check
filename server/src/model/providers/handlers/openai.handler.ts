import { CreateModelDto } from 'src/model/dto/create-model.dto';
import { UpdateModelDto } from 'src/model/dto/update-model.dto';
import { Model } from 'src/model/entities/model.entity';
import { IModelHandler } from '../model.handler';
import { DataSource, Repository } from 'typeorm';
import { KeyService } from 'src/key/key.service';
import { ProviderService } from 'src/provider/provider.service';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class OpenAiHandler implements IModelHandler {
  private readonly modelRepo: Repository<Model>;

  constructor(
    dataSource: DataSource,
    private readonly keyService: KeyService,
    private readonly providerService: ProviderService,
  ) {
    this.modelRepo = dataSource.getRepository(Model);
  }

  async create(dto: CreateModelDto) {
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

  async update(model: Model, dto: UpdateModelDto) {
    const { keyId, providerId } = dto;

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
}
