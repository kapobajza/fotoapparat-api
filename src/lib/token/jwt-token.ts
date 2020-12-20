import jsonwebtoken from 'jsonwebtoken';
import moment from 'moment';

import Config from '../../config';

export interface TokenType {
  iss: string;
  azp: string;
  aud: string;
  sub: string;
  email: string;
  email_verified: boolean;
  at_hash: string;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  locale: string;
  iat: number;
  exp: number;
  id: number;
  google_auth_token: string;
}

export interface TokenPayloadType {
  id: number;
}

export function decode(
  token: string | undefined | null,
  options?: jsonwebtoken.DecodeOptions | undefined
) {
  const t = jsonwebtoken.decode(token ?? '', options) as TokenType;
  return t;
}

export function sign(payload: TokenPayloadType) {
  return jsonwebtoken.sign(
    {
      ...payload,
      iat: moment().unix(),
      exp: moment().add(1, 'hour').unix(),
    },
    Config.TOKEN_SECRET
  );
}
