import express, { Express, Request, Response } from 'express';
import morgan from 'morgan';
import { Strategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import passport from 'passport';
import bodyParser from 'body-parser';
import session from 'express-session';
import createRedisStore from 'connect-redis';
import redis from 'redis';

import Config from './config';
import { ApiRouter } from './router';
import { handleHttpError, HttpError } from './networking';

export default class Server {
  app: Express;
  apiRouter: ApiRouter;

  constructor() {
    this.app = express();

    this.setupExpressApp();
    this.setupPassportStrategies();

    // The logger has to be set up before our router order for it to work
    this.setupLogger();
    this.apiRouter = new ApiRouter(this.app);

    this.setupGlobalErrorHandling();
  }

  // Set up the express app
  setupExpressApp() {
    this.app.disable('x-powered-by');
    this.app.set('port', Config.PORT);

    // Prepare Redis store for session
    const RedisStore = createRedisStore(session);
    const redisClient = redis.createClient();

    // Set up session using Redis as store
    this.app.use(
      session({
        secret: Config.SESSION_SECRET,
        saveUninitialized: false,
        resave: false,
        store: new RedisStore({
          host: Config.REDIS_HOST,
          port: Config.REDIS_PORT,
          client: redisClient,
          ttl: Config.REDIS_TTL,
        }),
      })
    );

    // Middleware to parse requests with JSON content
    this.app.use(bodyParser.json());
  }

  setupGlobalErrorHandling() {
    this.app.use((req, res) => {
      res.status(404).end();
    });

    // If the error isn't caught by the above function, catch and handle it here
    this.app.use((err: HttpError, req: Request, res: Response) => {
      handleHttpError(res, err);
    });
  }

  // Set up our logger
  setupLogger() {
    if (Config.IS_DEV_ENV) {
      this.app.use(morgan(':method :url :status :response-time ms - :date'));
    }
  }

  setupPassportStrategies() {
    const options: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: Config.TOKEN_SECRET,
    };

    passport.use(
      new Strategy(options, (payload, done) => {
        try {
          if (payload) {
            done(null, { ...payload });
          } else {
            done(null, false);
          }
        } catch (err) {
          done(err, false);
        }
      })
    );
  }

  // Start the express app with an optional callback as a parameter
  start(cb: (() => void) | null = null) {
    const that = this;

    const callback =
      cb ??
      (() => {
        const port = that.app?.get('port');
        const env = that.app?.get('env');

        console.log(`App listening on port ${port}, in ${env} environment`);
      });

    this.app?.listen(Config.PORT, callback);
  }
}
