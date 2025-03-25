import { createServer, route } from 'station-js'
import users from './src/users.js';

const main = route('/home', {
  GET: (ctx) => {
    return { body: 'Hello, World!' };
  }
})


const paths = [
  ...users,
  main,
]

const server = createServer(paths);
server.listen(3003);