/* eslint-disable no-unused-vars */
import session from 'express-session';

declare module 'express-session' {
  export interface SessionData {
    email: string;
    userId: number;
    googleAccessToken: string | null | undefined;
  }
}
