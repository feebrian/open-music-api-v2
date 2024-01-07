class ExportNotesHandler {
  constructor(producerService, playlistsService, validator) {
    this._producerService = producerService;
    this._playlistsService = playlistsService;
    this._validator = validator;
  }

  async postExportPlaylistHandler(req, h) {
    this._validator.validateExportPlaylistPayload(req.payload);
    const { playlistId } = req.params;
    const { userId } = req.auth.credentials;
    const { targetEmail } = req.payload;

    await this._playlistsService.verifyPlaylistOwner(playlistId, userId);

    const message = {
      playlistId,
      targetEmail,
    };

    await this._producerService.sendMessage('exports:playlist', JSON.stringify(message));

    const res = h.response({
      status: 'success',
      mesage: 'Permintaan Anda sedang kami proses',
    });
    res.code(201);
    return res;
  }
}

module.exports = ExportNotesHandler;
