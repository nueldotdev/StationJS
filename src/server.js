import { createServer as _createServer } from 'http';
import { matchRoute } from './route.js';
import { parseRequestBody } from './parse.js';
import chalk from 'chalk';
import path from 'path';
import { readFile } from 'fs/promises';
import { constrainedMemory } from 'process';


const contentTypes = {
  "svg": "image/svg+xml",
  "png": "image/png",
  "jpg": "image/jpeg",
  "jpeg": "image/jpeg",
  "gif": "image/gif",
  "ico": "image/x-icon",
  "css": "text/css",
  "js": "text/javascript",
  "json": "application/json"
};

function createServer(routes, options = { publicDir: null, staticDir: null, mediaDir: null }) {
  const publicDir = path.join(options.publicDir || 'views')
  const staticDir = path.join(options.staticDir || 'static');
  const mediaDir = path.join(options.mediaDir || 'media');

  const server = _createServer(async (req, res) => {
    const ctx = { req, res, params: {}, query: {}, body: null };

    // Parse the body
    if (['POST', 'PUT', 'PATCH', 'UPDATE'].includes(req.method)) {
      ctx.body = await parseRequestBody(req);
    }
    
    // Match route
    const match = matchRoute(req, routes);
    if (match) {
      try {
        // Run the route handler
        ctx.params = match.params;
        const result = await match.handler(ctx);
        console.info(`${chalk.bgBlueBright('[INFO]')} ${req.method} - ${req.url} - STATUS ${result.status || 200}`);
        ctx.res.writeHead(result.status || 200, { 'Content-Type': 'application/json' });
        ctx.res.end(JSON.stringify(result.body));
        return;
      } catch (err) {
        console.error(`[ERROR] ${req.method} - ${req.url} - STATUS ${err.status || 500} - MESSAGE \n${chalk.redBright(err.message)}`);
        res.writeHead(err.status || 500).end(err.message || 'Internal Server Error');
        return;
      }
    } 


    // file serving
    const urlPath = req.url
    const getPath = urlPath.split('/')

    const pathDir = getPath[1]
    const fileFromPath = getPath[getPath.length - 1]
    const fileType = fileFromPath.split('.')[1]


    if (pathDir === 'static') {    
      try {
        getPath.splice(1, 1);
        const filePath = path.join(process.cwd(), staticDir, getPath.join("/"));
        const absPath = path.resolve(filePath);
    
        const content = await readFile(absPath);
    
        const mimeType = contentTypes[fileType] || "application/octet-stream";
    
        ctx.res.writeHead(200, { 'Content-Type': mimeType });
        ctx.res.end(content);
        return;
      } catch (error) {
        console.error("Static file not found:", error);
        ctx.res.writeHead(404, { 'Content-Type': 'text/plain' });
        ctx.res.end(`404: Static file not found on server \n${error}`);
        return;
      }
    }
    
    if (pathDir === 'media') {
      try {
        getPath.splice(1, 1);
        const filePath = path.join(process.cwd(), mediaDir, getPath.join("/"));
        const absPath = path.resolve(filePath);
    
        const content = await readFile(absPath);
    
        const mimeType = contentTypes[fileType] || "application/octet-stream";
    
        ctx.res.writeHead(200, { 'Content-Type': mimeType });
        ctx.res.end(content);
        return;
      } catch (error) {
        console.error("Media file not found:", error);
        ctx.res.writeHead(404, { 'Content-Type': 'text/plain' });
        ctx.res.end(`404: Media file not found on server \n${error}`);
        return;
      }
    }
    
    
      

    const filePath = path.join(process.cwd(), publicDir, req.url === '/' ? 'index.html' : `${req.url}.html`);
    try {

      const absPath = path.resolve(filePath)
      const content = await readFile(absPath);

      ctx.res.writeHead(200, {'Content-Type': 'text/html'});
      ctx.res.end(content)

    } catch (error) {
      console.log(error)
      ctx.res.writeHead(200, {'Content-Type': 'text/html'});
      ctx.res.end("404: Page not found!")
    }
  });

  return {
    listen: (...args) => {
      console.log(chalk.blue(`🌌 Station is active at http://localhost:${args[0]}`));
      server.listen(...args)
    },
    error: (callback) => server.on('error', callback),
    close: () => server.close(),
    on: (event, callback) => server.on(event, callback),
    emit: (event) => server.emit(event),
    // route: (path, handler) => 
  };
}


export default createServer;