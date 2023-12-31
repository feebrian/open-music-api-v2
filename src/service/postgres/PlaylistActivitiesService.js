const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistActivitiesService {
  constructor() {
    this._pool = new Pool();
  }

  async addActivity({ playlistId, songId, userId, action }) {
    const id = `activity-${nanoid(16)}`;
    const time = new Date().toISOString();

    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, playlistId, songId, userId, action, time],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Aktivitas playlist gagal ditambahkan');
    }
  }

  async getPlaylistActivities(playlistId) {
    const query = {
      text: `SELECT p.id, u.username as username, s.title as song_title, psa.action as psa_action, psa.time as psa_time
              FROM playlists p
              LEFT JOIN playlist_song_activities psa ON psa.playlist_id = p.id
              LEFT JOIN users u ON u.id = psa.user_id 
              LEFT JOIN songs s ON s.id = psa.song_id 
              WHERE  p.id = $1`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Aktivitas playlist tidak ditemukan');
    }

    return {
      playlistId: result.rows[0].id,
      activities: result.rows
        .map((row) => ({
          username: row.username,
          title: row.song_title,
          action: row.psa_action,
          time: row.psa_time,
        })),
    };
  }
}

module.exports = PlaylistActivitiesService;
