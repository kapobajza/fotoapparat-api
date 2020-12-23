import { UserRepository } from '../repositories';
import { UserModelType } from '../models/user';

class UserService {
  async getByEmail(email: string) {
    return UserRepository.getByEmail(email, { fields: ['id, email, first_name, last_name'] });
  }

  async add(user: UserModelType) {
    return UserRepository.add(user);
  }

  // Create a user if it doesn't exist or get an existing one
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
