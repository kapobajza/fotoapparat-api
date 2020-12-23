import { BaseRepository, QueryOptions } from '../db';
import { UserModel, UserModelType } from '../models';

class UserRepository extends BaseRepository<UserModelType> {
  async getByEmail(email: string, options?: QueryOptions) {
    return this.findOne(UserModel, 'WHERE email = ?', [email], options);
  }

  async add(user: UserModelType) {
    return this.insert(UserModel, user);
  }
}

export default new UserRepository();
