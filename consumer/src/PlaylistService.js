const { Pool } = require('pg');

class PlaylistService {
  constructor() {
    this._pool = new Pool();
  }

  async getPlaylistSongs(id) {
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

    return { ...queryPlaylist.rows[0], songs: query.rows };
  }
}

module.exports = PlaylistService;
