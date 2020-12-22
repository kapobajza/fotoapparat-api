import moment from 'moment';

import { UserService, GoogleService } from '.';
import { jwt, generateRefreshToken } from '../lib/token';
import { AuthRepository } from '../repositories';
import { AuthModelType } from '../models/auth';
import { HttpUnauthorizedError } from '../networking';
import { errorMessages } from '../lib/error';

interface RefreshTokenResponse {
  token: string | null;
  error: Error | null;
}

class AuthService {
  async googleAuth(code: string) {
    const {
      tokens: { id_token, access_token },
    } = await GoogleService.getTokens(code);

    const { email, given_name, family_name } = jwt.decode(id_token);
    const user = await UserService.getOrAddUser({
      email,
      firstName: given_name,
      lastName: family_name,
    });

    const userId = user?.id ?? 0;
    const { refreshToken } = await this.getOrAddAuth({ userId });

    const token = jwt.sign({ id: userId });

    return {
      token,
      userId,
      email,
      googleAccessToken: access_token,
      refreshToken,
    };
  }

  async getOrAddAuth(data: AuthModelType) {
    const { userId } = data;
    let auth = await this.getByUserId(userId ?? 0);

    if (!auth) {
      auth = await this.add(userId ?? 0);
    }

    return auth;
  }

  async add(userId: number) {
    const expiresAt = moment().add(2, 'months').unix();
    const refreshToken = await generateRefreshToken();

    return AuthRepository.add({ userId, expiresAt, refreshToken });
  }

  async getByUserId(id: number) {
    return AuthRepository.getByUserId(id);
  }

  async refreshToken(token: string, userId: number): Promise<RefreshTokenResponse> {
    const { refreshToken, expiresAt } = await this.getByUserId(userId);

    if (refreshToken !== token) {
      return {
        token: null,
        error: new HttpUnauthorizedError(errorMessages.REFRESH_TOKEN_INVALID),
      };
    }

    if (moment().unix() > (expiresAt ?? 0)) {
      return {
        token: null,
        error: new HttpUnauthorizedError(errorMessages.SESSION_EXPIRED),
      };
    }

    const authToken = jwt.sign({ id: userId });

    return {
      token: authToken,
      error: null,
    };
  }
}

export default new AuthService();
