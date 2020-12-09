import { Router, RequestHandler, Request, Response, NextFunction } from 'express';
import { checkSchema, Schema, validationResult } from 'express-validator';

import { composeMiddleware } from '../../lib/middleware';

export class BaseApiController {
  router: Router;
  passportStrategy: RequestHandler | null;

  public constructor(passportStrategy: RequestHandler | null = null) {
    this.router = Router({ mergeParams: true });
    this.passportStrategy = passportStrategy;
  }

  // All routes defined below this call will require authorization
  setupAuthorization() {
    this.passportStrategy && this.router.use(this.passportStrategy);
  }

  validate(validators: Schema) {
    return composeMiddleware([
      checkSchema(validators),
      function validateMiddleware(req: Request, res: Response, next: NextFunction) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
          res.status(400).json({ errors: errors.array() });
        } else {
          next();
        }
      },
    ]);
  }
}
