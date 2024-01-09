class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }

  async postAlbumHandler(req, h) {
    this._validator.validateAlbumPayload(req.payload);
    const { name, year } = req.payload;

    const albumId = await this._service.addAlbum({ name, year });

    const res = h.response({
      status: 'success',
      data: {
        albumId,
      },
    });
    res.code(201);
    return res;
  }

  async getAlbumByIdHandler(req) {
    const { id } = req.params;

    const album = await this._service.getAlbumById(id);

    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  async putAlbumByIdHandler(req) {
    this._validator.validateAlbumPayload(req.payload);

    const { id } = req.params;

    await this._service.editAlbumById(id, req.payload);

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(req) {
    const { id } = req.params;

    await this._service.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }

  async postAlbumLikeHandler(req, h) {
    const { id: albumId } = req.params;
    const { userId } = req.auth.credentials;

    await this._service.verifyAlbum(albumId);
    await this._service.verifyNewLike(albumId, userId);

    await this._service.addAlbumLike(albumId, userId);

    const res = h.response({
      status: 'success',
      message: 'Berhasil menambahkan like pada album',
    });
    res.code(201);
    return res;
  }

  async getAlbumLikesHandler(req, h) {
    const { id: albumId } = req.params;

    const { result: likes, cache } = await this._service.getAlbumLikes(albumId);

    const res = h.response({
      status: 'success',
      data: {
        likes,
      },
    });

    if (cache) {
      res.header('X-Data-Source', 'cache');
    }

    return res;
  }

  async deleteAlbumLikeHandler(req) {
    const { id: albumId } = req.params;
    const { userId } = req.auth.credentials;

    await this._service.deleteAlbumLike(albumId, userId);

    return {
      status: 'success',
      message: 'Berhasil menghapus like pada album',
    };
  }
}

module.exports = AlbumsHandler;
