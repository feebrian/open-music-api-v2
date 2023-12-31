const PlaylistHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlists',
  version: '1.0.0',
  register: async (server, {
    playlistsService,
    songsService,
    playlistActivitiesService,
    validator,
  }) => {
    const playlistsHandler = new PlaylistHandler(
      playlistsService,
      songsService,
      playlistActivitiesService,
      validator,
    );
    server.route(routes(playlistsHandler));
  },
};
