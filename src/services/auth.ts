import moment from 'moment';

import { UserService, GoogleService } from '.';
import { jwt, generateRefreshToken } from '../lib/token';
import { AuthRepository } from '../repositories';
import { AuthModelType } from '../models/auth';

class AuthService {
  async googleAuth(code: string) {
    const {
      tokens: { id_token, access_token },
    } = await GoogleService.getTokens(code);

    const { email, given_name, family_name } = jwt.decode(id_token);
    let user = await UserService.getByEmail(email);
    let userId = user?.id ?? 0;
    let auth: AuthModelType;

    if (!user) {
      user = await UserService.add({
        email,
        firstName: given_name,
        lastName: family_name,
      });
      userId = user?.id ?? 0;

      auth = await this.add(userId);
    } else {
      auth = await this.getByUserId(userId);
    }

    const token = jwt.sign({ id: userId });
    return {
      token,
      userId,
      email,
      googleAccessToken: access_token,
      refreshToken: auth.refreshToken ?? '',
    };
  }

  async add(userId: number) {
    const expiresAt = moment().unix();
    const refreshToken = await generateRefreshToken();

    return AuthRepository.add({ userId, expiresAt, refreshToken });
  }

  async getByUserId(id: number) {
    return AuthRepository.getByUserId(id);
  }
}

export default new AuthService();
