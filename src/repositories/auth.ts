import { MySqlStore } from '../db';
import { AuthModel, AuthModelType } from '../models/auth';

class AuthRepository {
  async add(data: AuthModelType) {
    return MySqlStore.insert<AuthModelType>(AuthModel, data);
  }

  async getByUserId(id: number) {
    return MySqlStore.findOne<AuthModelType>(AuthModel, 'SELECT * FROM auth WHERE user_id = ?', [
      id,
    ]);
  }
}

export default new AuthRepository();
