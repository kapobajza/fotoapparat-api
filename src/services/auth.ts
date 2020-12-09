import GoogleService from './google';

class AuthService {
  async googleAuth(code: string) {
    const { tokens } = await GoogleService.getTokens(code);
    console.log('tokens', tokens);
  }
}

export default new AuthService();
