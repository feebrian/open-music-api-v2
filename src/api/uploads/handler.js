class UploadsHandler {
  constructor(storageService, albumsService, validator) {
    this._storageService = storageService;
    this._albumsService = albumsService;
    this._validator = validator;
  }

  async postAlbumsCoversHandler(req, h) {
    const { cover } = req.payload;
    const { id: albumId } = req.params;
    this._validator.validateImageHeaders(cover.hapi.headers);

    const coverUrl = await this._albumsService.getAlbumCover(albumId);

    if (coverUrl.cover) {
      this._storageService.checkFile(coverUrl.cover.split('/').slice(6).join('/'));
    }

    const filename = await this._storageService.writeFile(cover, cover.hapi);

    await this._albumsService.addAlbumCover(filename, albumId);

    const res = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    res.code(201);
    return res;
  }
}

module.exports = UploadsHandler;
