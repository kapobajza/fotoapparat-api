import { BaseApiController } from './base';
import HelloController from './hello';
import AuthController from './auth';

interface ControllersType {
  [key: string]: typeof BaseApiController;
}

const controllers: ControllersType = {
  HelloController,
  AuthController,
};

export default controllers;
