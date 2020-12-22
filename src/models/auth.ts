import { Schema } from 'express-validator';

import { IModel } from '../db';
import { validationMessages } from '../lib/validator';

export interface AuthModelType {
  id?: number;
  userId?: number;
  refreshToken?: string;
  expiresAt?: number;
}

const CODE_FIELD = 'code';
const REFRESH_TOKEN_FIELD = 'refreshToken';

export class AuthModel implements IModel {
  getFields() {
    return [
      'id',
      { db: 'user_id', to: 'userId' },
      { db: 'refresh_token', to: 'refreshToken' },
      { db: 'expires_at', to: 'expiresAt' },
    ];
  }

  getName() {
    return 'auth';
  }

  static getGoogleAuthValidators(): Schema {
    return {
      code: {
        in: ['body'],
        exists: {
          errorMessage: validationMessages.required(CODE_FIELD),
          options: {
            checkFalsy: true,
            checkNull: true,
          },
        },
        isString: {
          errorMessage: validationMessages.isType(CODE_FIELD, 'string'),
        },
      },
    };
  }

  static getRefreshTokenValidators(): Schema {
    return {
      refreshToken: {
        in: 'body',
        exists: {
          errorMessage: validationMessages.required(REFRESH_TOKEN_FIELD),
          options: {
            checkFalsy: true,
            checkNull: true,
          },
        },
        isString: {
          errorMessage: validationMessages.isType(REFRESH_TOKEN_FIELD, 'string'),
        },
      },
    };
  }
}
