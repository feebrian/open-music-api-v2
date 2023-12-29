require('dotenv').config();
const hapi = require('@hapi/hapi');

const init = async () => {
  const server = hapi.server({
    host: process.env.HOST,
    port: process.env.PORT,
  });

  await server.start();
  console.log(`Server start running on ${server.info.uri}`);
};

init();
