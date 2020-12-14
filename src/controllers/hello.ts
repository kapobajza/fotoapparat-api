import { Request, Response } from 'express';

import { BaseApiController } from './base';
import { handleHttpError } from '../networking';

export default class HelloController extends BaseApiController {
  public constructor() {
    super();

    this.router.get('/', this.hello);
  }

  public async hello(req: Request, res: Response) {
    try {
      res.send({ message: 'Hello, you have successfully connected!' });
    } catch (err) {
      handleHttpError(res, err);
    }
  }
}
