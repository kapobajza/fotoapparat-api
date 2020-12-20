import { Request, Response } from 'express';

import { AuthService } from '../services';

import { BaseApiController } from './base';
import { handleHttpError } from '../networking';
import { AuthModel } from '../models/auth';

export default class AuthController extends BaseApiController {
  public constructor() {
    super();
    this.router.post(
      '/google',
      this.validate(AuthModel.getGoogleAuthValidators()),
      this.googleAuth
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
}
