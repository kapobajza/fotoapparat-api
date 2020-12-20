import dotenv from 'dotenv';

dotenv.config();

const { env } = process;

export interface ConfigType {
  PORT: string;
  DEFAULT_MESSAGE: string;
  BASE_API_URL: string;
  IS_DEV_ENV: boolean;
  IS_TEST_ENV: boolean;
  IS_PROD_ENV: boolean;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  DB_HOST: string;
  DB_PORT: string;
  TOKEN_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_TTL: number;
  SESSION_SECRET: string;
}

const Config: ConfigType = {
  PORT: env.PORT ?? '3000',
  DEFAULT_MESSAGE: env.DEFAULT_MESSAGE ?? 'An error occurred',
  BASE_API_URL: env.BASE_API_URL ?? '/api/v1/',
  IS_DEV_ENV: env.NODE_ENV === 'development',
  IS_TEST_ENV: env.NODE_ENV === 'test',
  IS_PROD_ENV: env.NODE_ENV === 'production',
  DB_USER: env.DB_USER ?? 'root',
  DB_PASSWORD: env.DB_PASSWORD ?? 'root',
  DB_NAME: env.DB_NAME ?? 'test_db',
  DB_HOST: env.DB_HOST ?? 'localhost',
  DB_PORT: env.DB_PORT ?? '3306',
  TOKEN_SECRET: env.TOKEN_SECRET ?? 'secret123',
  GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID ?? '',
  GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET ?? '',
  REDIS_HOST: env.REDIS_HOST ?? 'localhost',
  REDIS_PORT: parseInt(env.REDIS_PORT ?? '', 10) ?? 6379,
  REDIS_TTL: parseInt(env.REDIS_TTL ?? '', 10) ?? 260,
  SESSION_SECRET: env.SESSION_SECRET ?? 'session_secret123',
};

export default Config;
