import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Key } from './entities/key.entity';
import { CreateKeyDto } from './dto/create-key.dto';
import { UpdateKeyDto } from './dto/update-key.dto';

@Injectable()
export class KeyService {
  private readonly keyRepo: Repository<Key>;

  constructor(private readonly dataSource: DataSource) {
    this.keyRepo = this.dataSource.getRepository(Key);
  }

  async findOne(id: number) {
    const key = await this.keyRepo.findOne({ where: { id } });

    if (!key) {
      throw new NotFoundException('Ключ API не был найден.');
    }

    return key;
  }

  findMany() {
    return this.keyRepo.find();
  }

  create(createKeyDto: CreateKeyDto) {
    const keyPlain = this.keyRepo.create(createKeyDto);

    return this.keyRepo.save(keyPlain);
  }

  async update(id: number, updateKeyDto: UpdateKeyDto) {
    const key = await this.findOne(id);

    Object.assign(key, updateKeyDto);

    return this.keyRepo.save(key);
  }

  async delete(id: number) {
    const key = await this.findOne(id);

    await this.keyRepo.remove(key);
  }
}
