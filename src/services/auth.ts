import GoogleService from './google';
import { jwt } from '../lib/jwt-token';
import { UserRepository } from '../repositories';

class AuthService {
  async googleAuth(code: string) {
    const {
      tokens: { id_token },
    } = await GoogleService.getTokens(code);

    const { email } = jwt.decode(id_token);
    const user = await UserRepository.getByEmail(email);

    console.log('user', user);
  }
}

export default new AuthService();
