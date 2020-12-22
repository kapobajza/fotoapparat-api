import { BaseRepository } from '../db';
import { AuthModel, AuthModelType } from '../models';

class AuthRepository extends BaseRepository<AuthModelType> {
  async add(data: AuthModelType) {
    return this.insert(AuthModel, data);
  }

  async getByUserId(id: number) {
    return this.findOne(AuthModel, 'WHERE user_id = ?', [id]);
  }
}

export default new AuthRepository();
