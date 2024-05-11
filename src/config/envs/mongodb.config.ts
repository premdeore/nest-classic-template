import { registerAs } from '@nestjs/config';

export const MONGODB_CONFIG = registerAs('mongodb', () => {
  return {
    DB_URL: process.env['DB_URL'],
  };
});
