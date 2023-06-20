const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
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
      text: 'SELECT p.id, p.name, p.username FROM playlists p LEFT JOIN users u ON p.owner = u.id WHERE p.owner = $1',
      values: [owner],
    };

    const { rows } = await this._pool.query(query);
    return rows;
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
  }

  async addPlaylistSong({ playlistId, songId, userId }) {
    const id = `playlist_song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlist_songs SELECT $1, $2, $3 WHERE EXISTS (SELECT 1 FROM songs WHERE "id" = $4) RETURNING id',
      values: [id, playlistId, songId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Id Song tidak ditemukan');
    }

    return result.rows[0].id;
  }

  async getPlaylistSongById(id) {
    const query = {
      text: `SELECT p.id, p.name, u.username, COALESCE(
        json_agg(
          json_build_object(
            'id', s.id,
            'title', s.title,
            'performer', s.performer
          )
        ) WHERE s.id IS NOT NULL, '[]') as songs FROM playlists p LEFT JOIN users u ON p.owner = u.id LEFT JOIN playlist_songs ps ON ps.playlist_id = p.id LEFT JOIN songs s ON s.id = ps.song_id WHERE p.id = $1 GROUP BY p.id, u.username
      `,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    return result.rows[0];
  }

  async deletePlaylistSongById({ playlistId, songId }) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Id Song tidak ditemukan');
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT owner FROM playlist WHERE id = $1',
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
      if (error instanceof NotFoundError) {
        throw error;
      }
    }
  }

}

module.exports = PlaylistsService;
