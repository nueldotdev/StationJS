import { stat } from "fs";
import { route, use } from "station-js";


const userList = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' },
]



const basePath = '/users';

const users = use(basePath, [
  route('/', {
    GET: (ctx) => {
      return { 
        body: { 
          users: userList 
        }, 
        status: 200 
      };
    },

    POST: (ctx) => {
      const { name } = ctx.body;
      const id = userList.length + 1;
      const user = { id, name };
      userList.push(user);
      return { 
        body: { 
          user 
        }, 
        status: 201 
      };
    }
  }),

  route('/@id', {
    GET: (ctx) => {
      const { id } = ctx.params;
      const user = userList.find((user) => user.id === parseInt(id));
      if (!user) {
        return { 
          body: { 
            error: 'User not found' 
          }, 
          status: 404 
        };
      }
      return { 
        body: { 
          user 
        }, 
        status: 200 
      };
    },

    DELETE: (ctx) => {
      const { id } = ctx.params;
      const index = userList.findIndex((user) => user.id === parseInt(id));
      if (index === -1) {
        return { 
          body: { 
            error: 'User not found' 
          }, 
          status: 404 
        };
      }
      userList.splice(index, 1);
      return { 
        body: { 
          message: 'User deleted' 
        }, 
        status: 200 
      };
    },

    PATCH: (ctx) => {
      const { id } = ctx.params;
      const index = userList.findIndex((user) => user.id === parseInt(id));
      if (index === -1) {
        return { 
          body: { 
            error: 'User not found' 
          }, 
          status: 404 
        };
      }

      const { name } = ctx.body;
      userList[index].name = name;
      return { 
        body: { 
          user: userList[index] 
        }, 
        status: 200 
      };
    }
  }),
]);


export default users;