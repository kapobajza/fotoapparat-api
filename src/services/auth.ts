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
  private async generateNewRefreshToken() {
    const expiresAt = moment().add(2, 'months').unix();
    const refreshToken = await generateRefreshToken();

    return { expiresAt, refreshToken };
  }

  async googleAuth(code: string) {
    const {
      tokens: { id_token, access_token },
    } = await GoogleService.getTokens(code);

    // Decode the id_token and get the required data from it
    const { email, given_name, family_name } = jwt.decode(id_token);
    const user = await UserService.getOrAddUser({
      email,
      firstName: given_name,
      lastName: family_name,
    });

    const userId = user?.id ?? 0;
    let { auth, hasAddedNewData } = await this.getOrAddAuth({ userId });

    // If an auth record already exists, generate a new refresh token for it
    if (!hasAddedNewData) {
      const { refreshToken, expiresAt } = await this.generateNewRefreshToken();
      await this.updateByUserId(userId ?? 0, { refreshToken, expiresAt });

      auth = {
        ...auth,
        refreshToken,
        expiresAt,
      };
    }

    // Generate a new, signed token
    const token = jwt.sign({ id: userId });

    return {
      token,
      userId,
      email,
      googleAccessToken: access_token,
      refreshToken: auth?.refreshToken,
    };
  }

  // Create a new auth record, or return an existing one
  async getOrAddAuth(data: AuthModelType) {
    const { userId } = data;
    let auth = await this.getByUserId(userId ?? 0);
    let hasAddedNewData = false;

    if (!auth) {
      auth = await this.add(userId ?? 0);
      hasAddedNewData = true;
    }

    return { auth, hasAddedNewData };
  }

  async add(userId: number) {
    const { expiresAt, refreshToken } = await this.generateNewRefreshToken();
    return AuthRepository.add({ userId, expiresAt, refreshToken });
  }

  async updateByUserId(userId: number, data: AuthModelType) {
    return AuthRepository.updateByUserId(userId, data);
  }

  async getByUserId(id: number) {
    return AuthRepository.getByUserId(id, {
      fields: ['id', 'expires_at', 'refresh_token', 'user_id'],
    });
  }

  async refreshToken(token: string, userId: number): Promise<RefreshTokenResponse> {
    const { refreshToken, expiresAt } = await this.getByUserId(userId);

    // If the refresh token doesn't match, return 401
    if (refreshToken !== token) {
      return {
        token: null,
        error: new HttpUnauthorizedError(errorMessages.REFRESH_TOKEN_INVALID),
      };
    }

    // If the refresh token has expired, return 401
    if (moment().unix() > (expiresAt ?? 0)) {
      return {
        token: null,
        error: new HttpUnauthorizedError(errorMessages.SESSION_EXPIRED),
      };
    }

    // Generate a new, refreshed token
    const authToken = jwt.sign({ id: userId });

    return {
      token: authToken,
      error: null,
    };
  }
}

export default new AuthService();
