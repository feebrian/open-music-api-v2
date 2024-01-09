const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({ title, year, genre, performer, duration, albumId }) {
    const id = `song-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, performer, genre, duration, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) throw new InvariantError('Lagu gagal ditambahkan');

    return result.rows[0].id;
  }

  async getSongs({ title, performer }) {
    let result;

    if (title && !performer) {
      result = await this._pool.query(
        'SELECT id, title, performer FROM songs WHERE title ILIKE $1',
        [`${title}%`],
      );
    }

    if (performer && !title) {
      result = await this._pool.query(
        'SELECT id, title, performer FROM songs WHERE performer ILIKE $1',
        [`${performer}%`],
      );
    }

    if (performer && title) {
      result = await this._pool.query(
        'SELECT id, title, performer FROM songs WHERE title ILIKE $1 AND performer ILIKE $2',
        [`${title}%`, `${performer}%`],
      );
    }

    if (!performer && !title) {
      result = await this._pool.query('SELECT id, title, performer FROM songs');
    }

    return result.rows;
  }

  async getSongById(songId) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) throw new NotFoundError('Lagu tidak ditemukan');

    return result.rows[0];
  }

  async editSongById(
    songId,
    { title, year, genre, performer, duration, albumId },
  ) {
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6 WHERE id = $7',
      values: [title, year, genre, performer, duration, albumId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) throw new NotFoundError('Lagu gagal diperbarui. Id tidak ditemukan');
  }

  async deleteSongById(songId) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1',
      values: [songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
  }

  async verifySong(songId) {
    const query = {
      text: 'SELECT id FROM songs WHERE id = $1',
      values: [songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) throw new NotFoundError('Lagu tidak ditemukan');
  }
}

module.exports = SongsService;
