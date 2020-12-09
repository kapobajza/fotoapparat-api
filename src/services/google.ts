import { google, Auth } from 'googleapis';

import Config from '../config';

class GoogleService {
  auth: Auth.OAuth2Client;

  constructor() {
    this.auth = new google.auth.OAuth2({
      clientId: Config.GOOGLE_CLIENT_ID,
      clientSecret: Config.GOOGLE_CLIENT_SECRET,
    });
  }

  getTokens(code: string) {
    return this.auth.getToken(code);
  }
}

export default new GoogleService();
