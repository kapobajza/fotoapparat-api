import { MySqlStore } from '../db';
import { UserModel, UserModelType } from '../models/user';

class UserRepository {
  async getByEmail(email: string) {
    return MySqlStore.findOne<UserModelType>(UserModel, 'SELECT * FROM users WHERE email = ?', [
      email,
    ]);
  }

  async add(user: UserModelType) {
    return MySqlStore.insert<UserModelType>(UserModel, user);
  }
}

export default new UserRepository();
