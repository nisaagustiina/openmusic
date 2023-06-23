const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const NotFoundError = require('../../exceptions/NotFoundError');

class PSAService {
  constructor() {
    this._pool = new Pool();
  }

  async addActivity({
    playlistId, songId, userId, action,
  }) {
    const id = `psa-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists_activities VALUES ($1, $2, $3, $4, $5) RETURNING id',
      values: [id, playlistId, songId, userId, action],
    };

    await this._pool.query(query);
  }

  async getActivitiesByPlaylistId({ playlistId }) {
    const query = {
      text: 'SELECT u.username, s.title, psa.action, psa.time FROM playlists_activities psa LEFT JOIN users u ON psa.user_id = u.id LEFT JOIN songs s ON psa.song_id = s.id WHERE psa.playlist_id = $1 ORDER BY psa.time ASC',
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Activity tidak ditemukan');
    }

    return result.rows;
  }

}

module.exports = PSAService;
