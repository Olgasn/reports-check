import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Provider } from './entities/provider.entity';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';

@Injectable()
export class ProviderService {
  private readonly providerRepo: Repository<Provider>;

  constructor(dataSource: DataSource) {
    this.providerRepo = dataSource.getRepository(Provider);
  }

  findMany() {
    return this.providerRepo.find();
  }

  async findOne(id: number) {
    const provider = await this.providerRepo.findOne({ where: { id } });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    return provider;
  }

  create(dto: CreateProviderDto) {
    const providerPlain = this.providerRepo.create(dto);

    return this.providerRepo.save(providerPlain);
  }

  async update(id: number, dto: UpdateProviderDto) {
    const provider = await this.findOne(id);

    Object.assign(provider, dto);

    return this.providerRepo.save(provider);
  }

  async delete(id: number) {
    const provider = await this.findOne(id);

    await this.providerRepo.remove(provider);
  }
}
