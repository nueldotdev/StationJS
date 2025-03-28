import { readdirSync } from "fs";
import path from "path";
import { Context } from "../utils/types.js";

/**
 * Represents a middleware configuration object.
 *
 * @property ignore - An optional function that determines whether a given path should be ignored.
 *                    It takes a `Set<string>` of paths as input and returns a boolean indicating
 *                    whether the path should be ignored.
 * @property handler - A function that processes the middleware logic. It takes a context object (`ctx`)
 *                     as input and returns a `Promise<boolean>` indicating the success or failure
 *                     of the middleware operation.
 */
export type Middleware = {
  ignore?: string[];
  handler: (ctx: Context, next: () => Promise<void>) => Promise<boolean>;
};


/**
 * A registry to store middleware functions.
 * 
 * This array holds instances of middleware, which are functions
 * that can be executed in sequence to handle requests or perform
 * specific operations in the application.
 * 
 * @type {Middleware[]} An array of middleware functions.
 */
export const middlewareRegistry: Middleware[] = [];


export const addMiddleware = (middleware: Middleware) => {
  middlewareRegistry.push(middleware);
}


/**
 * Dynamically loads middleware from the "middlewares" folder.
 */
export const loadMiddlewaresFromFolder = async () => {
  const middlewaresDir = path.resolve(process.cwd(), "middlewares");

  try {
    const files = readdirSync(middlewaresDir);

    for (const file of files) {
      // Only process .js or .mjs files
      if (file.endsWith('.js') || file.endsWith('.mjs')) {
        const filePath = path.join(middlewaresDir, file);
        
        // Use file:// protocol for universal URL conversion
        const fileUrl = `file://${path.resolve(filePath)}`;

        try {
          // Dynamically import the middleware file
          const module = await import(fileUrl);

          // Check if the module exports a middleware
          if (module.default) {
            const middleware = module.default;
            if (typeof middleware.handler === "function") {
              addMiddleware(middleware);
            }
          }
        } catch (importError) {
          console.error(`Error importing middleware ${file}: ${importError.message}`);
        }
      }
    }
  } catch (err) {
    console.error(`Error loading middlewares from folder: ${err.message}`);
  }
};

/**
 * Creates and registers a middleware function.
 *
 * @param middleware - The middleware function to be created.
 * @returns The provided middleware function.
 */
export const createMiddleware = (middleware: Middleware) => {
  return middleware;
};

/**
 * Retrieves all registered middleware.
 *
 * @returns An array of registered middleware functions.
 */
export const getMiddlewares = async () => {
  if (middlewareRegistry.length === 0) {
    await loadMiddlewaresFromFolder();
  }
  return middlewareRegistry;
};
