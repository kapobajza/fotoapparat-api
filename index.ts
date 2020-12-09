import Server from './src/server';

const init = () => {
  const server = new Server();
  server.start();
};

init();
