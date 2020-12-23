import { BaseRepository, QueryOptions } from '../db';
import { AuthModel, AuthModelType } from '../models';

class AuthRepository extends BaseRepository<AuthModelType> {
  async add(data: AuthModelType) {
    return this.insert(AuthModel, data);
  }

  async getByUserId(id: number, options?: QueryOptions) {
    return this.findOne(AuthModel, 'WHERE user_id = ?', [id], options);
  }

  async updateByUserId(userId: number, data: AuthModelType) {
    return this.set(AuthModel, data, 'WHERE user_id = ?', [userId]);
  }
}

export default new AuthRepository();
