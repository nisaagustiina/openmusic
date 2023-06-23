const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistSongsService {
  constructor(psaService) {
    this._pool = new Pool();
    this._psaService = psaService;
  }

  async addPlaylistSong({ playlistId, songId, userId }) {
    const id = `playlist_song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlist_songs SELECT $1, $2, $3 WHERE EXISTS (SELECT 1 FROM songs WHERE "id" = $4) RETURNING id',
      values: [id, playlistId, songId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Id Song tidak ditemukan');
    }

    await this._psaService.addActivity({
      playlistId, songId, userId, action: 'add',
    });

    return result.rows[0].id;
  }

  async deletePlaylistSongById({ playlistId, songId, userId }) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Id Song tidak ditemukan');
    }

    await this._psaService.addActivity({
      playlistId, songId, userId, action: 'delete',
    });
  }
}

module.exports = PlaylistSongsService;
