import { cleanEnv, str } from 'envalid';
import { Config } from 'src/types/config.types';
import * as fs from 'node:fs';
import * as path from 'node:path';

export const config = (): Config => {
  const env = cleanEnv(process.env, {
    DATABASE: str(),
  });

  const template = fs.readFileSync(path.join(process.cwd(), './prompt.template'), 'utf-8');

  const conf: Config = {
    db: {
      database: env.DATABASE,
    },
    prompt: {
      template,
    },
  };

  return conf;
};
