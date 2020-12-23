/* eslint-disable no-unused-vars */
import { Express } from 'express';

declare module 'express-serve-static-core' {
  export interface Request {
    email: string;
    userId: number;
    googleAccessToken: string | null | undefined;
  }
}
