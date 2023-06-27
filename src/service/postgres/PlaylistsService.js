const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const ClientError = require('../../exceptions/ClientError');

class PlaylistsService {
  constructor(collaborationsService) {
    this._pool = new Pool();
    this._collaborationsService = collaborationsService;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Palylist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylists({ owner }) {
    const query = {
      text: 'SELECT p.id, p.name, u.username FROM playlists p LEFT JOIN users u ON p.owner = u.id LEFT JOIN collaborations c ON c.playlist_id = p.id WHERE p.owner = $1 OR c.user_id = $1',
      values: [owner],
    };

    const { rows } = await this._pool.query(query);
    return rows;
  }

  async getPlaylistById({ id }) {
    const queryPlaylist = await this._pool.query({
      text: `SELECT p.id, p.name, u.username FROM playlists p LEFT JOIN users u ON p.owner = u.id
      WHERE p.id = $1`,
      values: [id],
    });

    const query = await this._pool.query({
      text: `SELECT s.id, s.title, s.performer
      FROM songs s 
      JOIN playlist_songs ps ON s.id = ps.song_id
      WHERE ps.playlist_id = $1`,
      values: [id],
    });

    if (!queryPlaylist.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    return { ...queryPlaylist.rows[0], songs: query.rows };
  }

  async deletePlaylistById({ id }) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
  }

  async verifyPlaylistOwner({ id, owner }) {
    const query = {
      text: 'SELECT owner FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = result.rows[0];

    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyPlaylistAccess({ playlistId, userId }) {
    try {
      await this.verifyPlaylistOwner({ id: playlistId, owner: userId });
    } catch (error) {
      if (error instanceof ClientError) {
        throw error;
      }
    }

    try {
      await this._collaborationsService.verifyCollaboration({ playlistId, userId });
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
    }
  }

}

module.exports = PlaylistsService;
