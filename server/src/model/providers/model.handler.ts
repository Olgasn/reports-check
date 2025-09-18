import { CreateModelDto } from '../dto/create-model.dto';
import { UpdateModelDto } from '../dto/update-model.dto';
import { Model } from '../entities/model.entity';

export interface IModelHandler {
  create(dto: CreateModelDto): Promise<Model>;
  update(model: Model, dto: UpdateModelDto): Promise<Model>;
}
