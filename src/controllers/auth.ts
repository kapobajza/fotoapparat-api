import { Request, Response } from 'express';

import { GoogleService } from '../services';

import { BaseApiController } from './base';
import { handleHttpError } from '../networking';
import { AuthModel } from '../models/auth';

export default class AuthController extends BaseApiController {
  public constructor() {
    super();
    this.router.post('/google', this.validate(AuthModel.getValidators()), this.googleAuth);
  }

  public async googleAuth(req: Request, res: Response) {
    try {
      const { code } = req.body;
      const { tokens } = await GoogleService.getTokens(code);
      res.send({ ...tokens });
    } catch (err) {
      handleHttpError(res, err);
    }
  }
}
