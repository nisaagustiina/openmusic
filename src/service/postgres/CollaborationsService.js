const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class CollaborationsService {
  constructor() {
    this._pool = new Pool();
  }

  async addCollaboration({ playlistId, userId }) {
    const id = `collab-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO collaborations SELECT $1, $2, $3 WHERE EXISTS (SELECT 1 FROM users WHERE "id" = $4) RETURNING id',
      values: [id, playlistId, userId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Collaboration gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async deleteCollaboration({ playlistId, userId }) {
    const query = {
      text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Collaboration tidak ditemukan');
    }
  }

  async verifyCollaborations({ playlistId, userId }) {
    const query = {
      text: 'SELECT id FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Collaboration tidak ditemukan');
    }

  }
}

module.exports = CollaborationsService;
