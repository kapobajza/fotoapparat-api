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
      await AuthService.googleAuth(code);
      res.send('Nice job!');
    } catch (err) {
      handleHttpError(res, err);
    }
  }
}
