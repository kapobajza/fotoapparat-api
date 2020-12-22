import { Request, Response, RequestHandler } from 'express';

import { AuthService } from '../services';

import { BaseApiController } from './base';
import { handleHttpError } from '../networking';
import { AuthModel } from '../models/auth';

export default class AuthController extends BaseApiController {
  public constructor(passportStrategy: RequestHandler) {
    super(passportStrategy);

    this.router.post(
      '/google',
      this.validate(AuthModel.getGoogleAuthValidators()),
      this.googleAuth
    );

    this.setupAuthorization();
    this.router.post(
      '/refresh-token',
      this.validate(AuthModel.getRefreshTokenValidators()),
      this.refreshToken
    );
  }

  public async googleAuth(req: Request, res: Response) {
    try {
      const { code } = req.body;
      const {
        token,
        googleAccessToken,
        userId,
        email,
        refreshToken,
      } = await AuthService.googleAuth(code);

      req.session.email = email;
      req.session.googleAccessToken = googleAccessToken;
      req.session.userId = userId;

      res.send({ token, refreshToken });
    } catch (err) {
      handleHttpError(res, err);
    }
  }

  public async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      const { error, token } = await AuthService.refreshToken(
        refreshToken,
        req.session.userId ?? 0
      );

      if (error) {
        throw error;
      }

      res.send({ token });
    } catch (err) {
      handleHttpError(res, err);
    }
  }
}
