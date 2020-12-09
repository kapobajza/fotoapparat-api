import { Request, Response } from 'express';

import { BaseApiController } from './base';
import { handleHttpError } from '../networking';
import { UserRepository } from '../repositories';

export default class HelloController extends BaseApiController {
  public constructor() {
    super();

    this.router.get('/', this.hello);
  }

  public async hello(req: Request, res: Response) {
    try {
      // console.log('response', response);
      const user = await UserRepository.getByEmail('kapo@email.com');
      console.log('user', user);

      res.send({ message: 'Hello, you have successfully connected!' });
    } catch (err) {
      handleHttpError(res, err);
    }
  }
}
