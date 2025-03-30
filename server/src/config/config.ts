import { cleanEnv, str } from 'envalid';
import { Config } from 'src/types/config.types';

export const config = (): Config => {
  const env = cleanEnv(process.env, {
    DATABASE: str(),
  });

  const conf: Config = {
    db: {
      database: env.DATABASE,
    },
  };

  return conf;
};
