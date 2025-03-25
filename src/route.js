import {parseRequest} from './parse.js';


function route(path, handler) {
  return { path, handler };
}


function use(basePath, routes) {
  return routes.map(({ path: childPath, handler }) => ({
    path: `${basePath}${childPath === '/' ? '' : childPath}`,
    handler: handler,
  }));
}


function matchPath(routePath, requestPath) {
  const routeSegments = routePath.split('/').filter(Boolean); // Break route path into segments
  const requestSegments = requestPath.split('/').filter(Boolean); // Break request path into segments

  if (routeSegments.length !== requestSegments.length) {
    return null; // Paths with different segment counts don't match
  }

  const params = {};

  for (let i = 0; i < routeSegments.length; i++) {
    const routeSegment = routeSegments[i];
    const requestSegment = requestSegments[i];

    if (routeSegment.startsWith('@')) {
      // Dynamic parameter
      const paramName = routeSegment.slice(1); // Remove the leading '@'
      params[paramName] = requestSegment; // Assign the value to the parameter name
    } else if (routeSegment !== requestSegment) {
      // Static segment doesn't match
      return null;
    }
  }

  return { params }; // Return matched parameters if all segments match
}


function matchRoute(req, routes) {
  const { pathname, method } = parseRequest(req);

  for (const route of routes) {

    const match = matchPath(route.path, pathname);
    if (match) {
      const handler = typeof route.handler === 'function'
        ? route.handler // Single-method route
        : route.handler[method]; // Multi-method route

      if (handler) {
        return { handler, params: match.params };
      }
    }
  }

  return null;
}




export { route, use, matchRoute };