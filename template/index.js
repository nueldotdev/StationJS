import { createServer, route } from 'station-x';
import users from './src/users.js';

const main = route('/home', {
  GET: (ctx) => {
    ctx.status(200).json({ message: 'Hello, World!' });
  }
})


const paths = [
  ...users,
  main,
]

const server = createServer(paths);
server.listen(3003);