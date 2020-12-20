import { decode, sign, TokenType, TokenPayloadType } from './jwt-token';
import generateRefreshToken from './generate-refresh-token';

const jwt = { decode, sign };

export { jwt, TokenType, TokenPayloadType, generateRefreshToken };
