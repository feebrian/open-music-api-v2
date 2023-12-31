class CollaborationsHandler {
  constructor(collaborationsService, playlistsService, usersService, validator) {
    this._collaborationsService = collaborationsService;
    this._playlistsService = playlistsService;
    this._usersService = usersService;
    this._validator = validator;
  }

  async postCollaborationHandler(req, h) {
    this._validator.validateCollaborationPayload(req.payload);

    const { playlistId, userId } = req.payload;
    const { userId: owner } = req.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(playlistId, owner);
    await this._usersService.verifyUser(userId);

    const collaborationId = await this._collaborationsService.addCollaboration({
      playlistId,
      userId,
    });

    const res = h.response({
      status: 'success',
      data: {
        collaborationId,
      },
    });
    res.code(201);
    return res;
  }

  async deleteCollaborationHandler(req) {
    this._validator.validateCollaborationPayload(req.payload);

    const { playlistId, userId } = req.payload;
    const { userId: owner } = req.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(playlistId, owner);

    await this._collaborationsService.deleteCollaboration(playlistId, userId);

    return {
      status: 'success',
      message: 'Kolaborasi berhasil dihapus',
    };
  }
}

module.exports = CollaborationsHandler;
