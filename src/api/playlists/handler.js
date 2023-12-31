class PlaylistHandler {
  constructor(playlistsService, songsService, validator) {
    this._playlistsService = playlistsService;
    this._songsService = songsService;
    this._validator = validator;
  }

  async postPlaylistHandler(req, h) {
    this._validator.validatePlaylistPayload(req.payload);
    const { name } = req.payload;
    const { userId: owner } = req.auth.credentials;

    const playlistId = await this._playlistsService.addPlaylist({ name, owner });

    const res = h.response({
      status: 'success',
      data: {
        playlistId,
      },
    });
    res.code(201);
    return res;
  }

  async getPlaylistsHandler(req) {
    const { userId: owner } = req.auth.credentials;

    const playlists = await this._playlistsService.getPlaylists(owner);

    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistHandler(req) {
    const { id: playlistId } = req.params;
    const { userId: owner } = req.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(playlistId, owner);

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }
}

module.exports = PlaylistHandler;
