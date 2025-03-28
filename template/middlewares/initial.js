import { createMiddleware } from "station-x";

export default createMiddleware({
  ignore: ['/home'],
  handler: async (ctx, next) => {
    console.log("Middleware: Before", ctx.req.url);
    await next();  // Use await to properly wait for the next middleware
    console.log("Middleware: After", ctx.req.url);
    return true;
  },
});