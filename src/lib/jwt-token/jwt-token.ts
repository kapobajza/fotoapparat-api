import jsonwebtoken from 'jsonwebtoken';

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
}

export function decode(
  token: string | undefined | null,
  options?: jsonwebtoken.DecodeOptions | undefined
) {
  const t = jsonwebtoken.decode(token ?? '', options) as TokenType;
  return t;
}
