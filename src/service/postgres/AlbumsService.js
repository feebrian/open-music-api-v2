const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const config = require('../../utils/config');

class AlbumsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Album gagal dibuat');
    }

    return result.rows[0].id;
  }

  async addAlbumCover(filename, playlistId) {
    const coverUrl = `http://${config.app.host}:${config.app.port}/uploads/file/covers/${filename}`;

    const query = {
      text: 'UPDATE albums SET cover = $1 WHERE id = $2',
      values: [coverUrl, playlistId],
    };

    await this._pool.query(query);
  }

  async getAlbumCover(albumId) {
    const query = {
      text: 'SELECT cover FROM albums WHERE id = $1',
      values: [albumId],
    };

    const result = await this._pool.query(query);

    return result.rows[0];
  }

  async getAlbumById(albumId) {
    const query = {
      text: `SELECT a.id, a.name, a.year, a.cover as cover_url, s.id as song_id, s.title as song_title, s.performer as song_performer
              FROM albums a
              LEFT JOIN songs s ON a.id = s.album_id 
              WHERE a.id = $1`,
      values: [albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    return {
      id: result.rows[0].id,
      name: result.rows[0].name,
      year: result.rows[0].year,
      coverUrl: result.rows[0].cover_url,
      songs: result.rows
        .map((row) => ({
          id: row.song_id,
          title: row.song_title,
          performer: row.song_performer,
        }))
        .filter((song) => song.id),
    };
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3',
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Album gagal diperbarui. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }

  async addAlbumLike(albumId, userId) {
    const id = `like-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3)',
      values: [id, userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) throw new InvariantError('Gagal menambahkan like pada album');

    await this._cacheService.delete(`albums:${albumId}`);
  }

  async getAlbumLikes(albumId) {
    try {
      const result = await this._cacheService.get(`albums:${albumId}`);
      return {
        result: JSON.parse(result),
        cache: true,
      };
    } catch (error) {
      const query = {
        text: 'SELECT album_id FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };

      const result = await this._pool.query(query);

      await this._cacheService.delete(`albums:${albumId}`);
      await this._cacheService.set(`albums:${albumId}`, JSON.stringify(result.rowCount));

      return {
        result: result.rowCount,
        cache: false,
      };
    }
  }

  async deleteAlbumLike(albumId, userId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) throw new InvariantError('Gagal menghapus like album');

    await this._cacheService.delete(`albums:${albumId}`);
  }

  async verifyAlbum(albumId) {
    const query = {
      text: 'SELECT id FROM albums WHERE id = $1',
      values: [albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) throw new NotFoundError('Album tidak ditemukan');
  }

  async verifyNewLike(albumId, userId) {
    const query = {
      text: 'SELECT id FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (result.rowCount) throw new InvariantError('Anda sudah menyukai album ini');
  }
}

module.exports = AlbumsService;
