const ExportNotesHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'exports',
  version: '1.0.0',
  register: async (server, { producerService, playlistsService, validator }) => {
    const exportNotesHandler = new ExportNotesHandler(producerService, playlistsService, validator);
    server.route(routes(exportNotesHandler));
  },
};
