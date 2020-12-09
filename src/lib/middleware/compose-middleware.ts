import { RequestHandler, Request, Response, NextFunction } from 'express';
import { flatten } from 'lodash';

import { handleHttpError, HttpError } from '../../networking';

export default function composeMiddleware(stack: any[]) {
  // Flatten the stack of handlers, so that we don't have multi-dimensional arrays
  const flattenedStack = flatten(stack) as RequestHandler[];

  return function middleware(req: Request, res: Response, done: NextFunction) {
    // A recursive function which will iterate through the handlers and execute them
    const dispatch = (pos: number) => {
      const handler = flattenedStack[pos];

      try {
        if (pos === flattenedStack.length) {
          return done();
        }

        if (typeof handler !== 'function') {
          throw new TypeError('Handlers must be functions');
        }

        // When a handler completes its execution and calls the 'next' function,
        // we will begin a new iteration
        function next() {
          return dispatch(pos + 1);
        }

        return handler(req, res, next);
      } catch (err) {
        // If we catch an error, stop the execution and return an internal server error (500)
        handleHttpError(
          res,
          new HttpError(`Handler ${handler?.name ?? '<anonymous>'} returned error: ${err}`, 500)
        );
      }
    };

    return dispatch(0);
  };
}
