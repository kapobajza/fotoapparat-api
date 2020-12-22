import { UserRepository } from '../repositories';
import { UserModelType } from '../models/user';

class UserService {
  async getByEmail(email: string) {
    return UserRepository.getByEmail(email);
  }

  async add(user: UserModelType) {
    return UserRepository.add(user);
  }

  async getOrAddUser(data: UserModelType) {
    const { email, firstName, lastName } = data;
    let user = await this.getByEmail(email);

    if (!user) {
      user = await this.add({
        email,
        firstName,
        lastName,
      });
    }

    return user;
  }
}

export default new UserService();
