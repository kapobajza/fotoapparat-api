import { MySqlStore } from '../db';
import { UserModel, UserModelType } from '../models/user';

class UserRepository {
  async getByEmail(email: string) {
    return MySqlStore.queryOne<UserModelType>(UserModel, 'SELECT * FROM users WHERE email = ?', [
      email,
    ]);
  }
}

export default new UserRepository();
