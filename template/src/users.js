import { route, use } from "station-x";


const userList = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' },
]



const basePath = '/users';

const users = use(basePath, [
  route('/', {
    GET: (ctx) => {
      ctx.status(200).json({users: userList});  
    },

    POST: (ctx) => {
      const { name } = ctx.body;
      const id = userList.length + 1;
      const user = { id, name };
      userList.push(user);
      ctx.status(201).json({user});
    }
  }),

  route('/@id', {
    GET: (ctx) => {
      const { id } = ctx.params;
      const user = userList.find((user) => user.id === parseInt(id));
      if (!user) {
        ctx.status(404).json({error: 'User not found'});
        return;
      }
      ctx.status(200).json({user});
    },

    DELETE: (ctx) => {
      const { id } = ctx.params;
      const index = userList.findIndex((user) => user.id === parseInt(id));
      if (index === -1) {
        ctx.status(404).json({error: 'User not found'});
        return;
      }
      userList.splice(index, 1);
      ctx.status(204).json({message: 'User deleted'});
    },

    PATCH: (ctx) => {
      const { id } = ctx.params;
      const index = userList.findIndex((user) => user.id === parseInt(id));
      if (index === -1) {
        ctx.status(404).json({error: 'User not found'});
        return
      }

      const { name } = ctx.body;
      userList[index].name = name;
      ctx.status(200).json({user: userList[index]});
    }
  }),
]);


export default users;