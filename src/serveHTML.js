import { readFile } from 'fs';
import path from 'path'


export function serveHTML(filePath) {
  return async (ctx) => {
    try {
      const absPath = path.resolve(filePath);

      console.log(absPath)

      const content =  readFile(absPath, 'utf8');
      ctx.res.writeHead(200, {'Content-Type': 'text/html'});
      ctx.res.end(content)
    } catch (err) {
      ctx.res.writeHead(200, {'Content-Type': 'text/html'});
      ctx.res.end("404: Page not found!")
    }
  }
}