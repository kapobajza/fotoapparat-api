import { BaseRepository } from '../db';
import { UserModel, UserModelType } from '../models';

class UserRepository extends BaseRepository<UserModelType> {
  async getByEmail(email: string, fields?: string[]) {
    return this.findOne(UserModel, 'WHERE email = ?', [email]);
  }

  async add(user: UserModelType) {
    return this.insert(UserModel, user);
  }
}

export default new UserRepository();
