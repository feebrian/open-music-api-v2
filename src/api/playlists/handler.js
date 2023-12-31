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

    await this._playlistsService.deletePlaylistById(playlistId);

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async postSongToPlaylistHandler(req, h) {
    this._validator.validatePostSongToPlaylistPayload(req.payload);
    const { songId } = req.payload;
    const { id: playlistId } = req.params;
    const { userId: owner } = req.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(playlistId, owner);
    await this._songsService.verifySong(songId);

    await this._playlistsService.addSongToPlaylist({ playlistId, songId });

    const res = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke playlist',
    });
    res.code(201);
    return res;
  }

  async getSongsFromPlaylistHandler(req) {
    const { id: playlistId } = req.params;
    const { userId: owner } = req.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(playlistId, owner);

    const playlist = await this._playlistsService.getSongsFromPlaylist(playlistId);

    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deleteSongFromPlaylistHandler(req) {
    this._validator.validateDeleteSongFromPlaylistPayload(req.payload);
    const { songId } = req.payload;
    const { id: playlistId } = req.params;
    const { userId: owner } = req.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(playlistId, owner);
    await this._songsService.verifySong(songId);

    await this._playlistsService.deleteSongFromPlaylist(playlistId, songId);

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    };
  }
}

module.exports = PlaylistHandler;
