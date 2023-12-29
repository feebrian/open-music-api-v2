require('dotenv').config();
const hapi = require('@hapi/hapi');
const ClientError = require('./exceptions/ClientError');

// albums
const albums = require('./api/albums');
const AlbumsService = require('./service/postgres/AlbumsService');
const AlbumsValidator = require('./validator/albums');

// songs
const songs = require('./api/songs');
const SongsService = require('./service/postgres/SongsService');
const SongsValidator = require('./validator/songs');

const init = async () => {
  const albumsService = new AlbumsService();
  const songsService = new SongsService();

  const server = hapi.server({
    host: process.env.HOST,
    port: process.env.PORT,
  });

  // internal plugin
  await server.register([
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: AlbumsValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
  ]);

  server.ext('onPreResponse', (req, h) => {
    const { response } = req;

    if (response instanceof Error) {
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });

        newResponse.code(response.statusCode);
        return newResponse;
      }

      if (!response.isServer) {
        return h.continue;
      }

      const newResponse = h.response({
        status: 'error',
        message: 'Terjadi kegagalan pada server kami',
      });

      newResponse.code(500);
      console.error(response);
      return newResponse;
    }

    return h.continue;
  });

  await server.start();
  // eslint-disable-next-line no-console
  console.log(`Server start running on ${server.info.uri}`);
};

init();
