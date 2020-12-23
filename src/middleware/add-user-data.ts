import { Request, Response, NextFunction } from 'express';

import { handleHttpError } from '../networking';
import { jwt } from '../lib/token';

// Middleware to add additional user data from the token to the req object
export default function (req: Request, res: Response, next: NextFunction) {
  try {
    const { authorization } = req.headers;
    const bearerText = authorization?.substr(0, 7)?.toLowerCase();

    if (bearerText === 'bearer ') {
      const token = authorization?.substr(bearerText.length);
      const { email, googleAccessToken, id } = jwt.decode(token);

      req.email = email;
      req.googleAccessToken = googleAccessToken;
      req.userId = id;
    }

    next();
  } catch (err) {
    handleHttpError(res, err);
  }
}
