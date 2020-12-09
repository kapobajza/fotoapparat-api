import { IModel } from '../db';

export interface UserModelType {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

export class UserModel implements IModel {
  getFields() {
    return [
      'id',
      'email',
      { db: 'first_name', to: 'firstName' },
      { db: 'last_name', to: 'lastName' },
    ];
  }
}
