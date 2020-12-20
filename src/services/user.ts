import { UserRepository } from '../repositories';
import { UserModelType } from '../models/user';

class UserService {
  async getByEmail(email: string) {
    return UserRepository.getByEmail(email);
  }

  async add(user: UserModelType) {
    return UserRepository.add(user);
  }
}

export default new UserService();
