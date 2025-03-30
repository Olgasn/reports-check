import { Module } from '@nestjs/common';
import { KeyModule } from './key/key.module';
import { ConfigModule } from '@nestjs/config';
import { TypeormModule } from './typeorm/typeorm.module';
import { config } from './config/config';
import { ModelModule } from './model/model.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
    }),
    TypeormModule,
    KeyModule,
    ModelModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
