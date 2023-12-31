const { trackPlaylistAction } = require('../../utils');

class PlaylistHandler {
  constructor(playlistsService, songsService, playlistActivitiesService, validator) {
    this._playlistsService = playlistsService;
    this._songsService = songsService;
    this._playlistActivitiesService = playlistActivitiesService;
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
    const { userId } = req.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);
    await this._songsService.verifySong(songId);

    const queryResult = await this._playlistsService.addSongToPlaylist({ playlistId, songId });
    const action = trackPlaylistAction(queryResult);
    await this._playlistActivitiesService.addActivity({ playlistId, songId, userId, action });

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

    await this._playlistsService.verifyPlaylistAccess(playlistId, owner);

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
    const { userId } = req.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);
    await this._songsService.verifySong(songId);

    const queryResult = await this._playlistsService.deleteSongFromPlaylist(playlistId, songId);
    const action = trackPlaylistAction(queryResult);
    await this._playlistActivitiesService.addActivity({ playlistId, songId, userId, action });

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    };
  }

  async getPlaylistActivitiesHandler(req) {
    const { id: playlistId } = req.params;
    const { userId } = req.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);

    const activities = await this._playlistActivitiesService.getPlaylistActivities(playlistId);

    return {
      status: 'success',
      data: activities,
    };
  }
}

module.exports = PlaylistHandler;
