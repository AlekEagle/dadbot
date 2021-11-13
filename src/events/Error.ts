import { EventModule } from '../types';

const Error: EventModule = {
  name: 'error',

  handler(client, err) {
    console.error(err);
  }
};

export default Error;
