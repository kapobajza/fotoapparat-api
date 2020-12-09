import { Express } from 'express';
import _ from 'lodash';
import passport from 'passport';

import Config from '../config';
import controllers from '../controllers';

type RouteHttpMethod = 'get' | 'post' | 'put' | 'delete';

interface LogRouteType {
  path: string;
  method: RouteHttpMethod;
}

type RouterLayerName = 'bound dispatch' | 'router' | 'middleware' | '<anonymous>';

interface RouterLayerType {
  name: RouterLayerName;
  regexp: typeof RegExp;
  path: string;
  method: RouteHttpMethod;
  route: {
    path: string;
    stack: RouterLayerType[];
  };
  handle: {
    stack: RouterLayerType[];
  };
  keys: { name: string; offset: number }[];
}

export default class ApiRouter {
  app: Express;

  constructor(app: Express) {
    this.app = app;

    this.bindRoutes(Config.BASE_API_URL);
  }

  // Get all routes for the purpose of logging them to the console
  getRoutesForLogging(stack: RouterLayerType[], parentName: string): LogRouteType[] {
    let routes: LogRouteType[] = [];

    // Iterate through the stack of routes
    stack.forEach((stackItem) => {
      // If the stack name is 'bound dispatch' it means that the router has no children
      if (stackItem.name === 'bound dispatch') {
        const mappedRoutes = stackItem.route.stack
          // Filter out middleware and middleware named '<anonymous>'
          // cause they're not actually routes
          .filter((r) => r.name !== 'middleware' && r.name !== '<anonymous>')
          .map<LogRouteType>((r) => ({
            method: r.method,
            path: `${Config.BASE_API_URL}${
              stackItem.route.path ? `${parentName}${stackItem.route.path}` : parentName
            }`,
          }));

        routes = [...routes, ...mappedRoutes];
      } else if (stackItem.name === 'router') {
        // Otherwise the router has children

        // Check if the route has a param, such as :id
        const filteredRouteParam = stackItem.keys.filter((key) => key.offset === 1)[0];
        const routeParam = filteredRouteParam ? `:${filteredRouteParam.name}` : '';

        // Get the child name from the regexp
        const child = stackItem.regexp
          .toString()
          .replace('/^\\/', '')
          .replace('\\/?(?=\\/|$)/i', '')
          .replace('(?:([^\\/]+?))\\', '');

        // Get the routes from the child router
        const returnedRoutes = this.getRoutesForLogging(
          stackItem.handle.stack,
          `${parentName}/${routeParam}${child}`
        );
        routes = [...routes, ...returnedRoutes];
      }
    });

    return routes;
  }

  getHttpMethodColor(method: RouteHttpMethod) {
    switch (method) {
      case 'get':
        // Yellow
        return '\x1b[33m';

      case 'post':
        // Blue
        return '\x1b[34m';

      case 'put':
        // Cyan
        return '\x1b[36m';

      case 'delete':
        // Red
        return '\x1b[31m';

      default:
        // Default color
        return '\x1b[0m';
    }
  }

  // Log the routes to the console
  logRoutes(routes: LogRouteType[]) {
    routes.forEach((r) => {
      console.log(
        `${this.getHttpMethodColor(r.method)}${_.padStart(r.method.toUpperCase(), 10)}  \x1b[32m${
          r.path
        }\x1b[0m`
      );
    });
  }

  // Bind all routes from controller to the Express app
  bindRoutes(url: string) {
    // Initialize a new jwt strategy to use for authorization in controllers
    const passportStrategy = passport.authenticate('jwt', { session: false });

    console.log('\nAPI routes:\n');

    Object.keys(controllers).forEach((key) => {
      const routeName = key.replace('Controller', '').toLowerCase();
      const Controller = new controllers[key](passportStrategy);
      this.app.use(`${url}${routeName}`, Controller.router);

      const routes = this.getRoutesForLogging(Controller.router.stack, routeName);
      this.logRoutes(routes);
    });

    console.log('\n');
  }
}
