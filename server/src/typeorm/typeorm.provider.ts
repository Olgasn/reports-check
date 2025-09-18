import { ConfigService } from '@nestjs/config';
import { DbConfig } from 'src/types/config.types';

import { DataSource } from 'typeorm';

export const provider = {
  provide: DataSource,
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const dbConfig = configService.get<DbConfig>('db')!;

    const dataSource = new DataSource({
      type: 'sqlite',
      database: dbConfig.database,
      synchronize: true,
      entities: [`${__dirname}/../**/**.entity{.ts,.js}`],
    });

    await dataSource.initialize();

    return dataSource;
  },
};
