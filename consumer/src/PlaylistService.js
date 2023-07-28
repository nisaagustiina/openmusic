const { Pool } = require('pg');

class PlaylistService {
  constructor() {
    this._pool = new Pool();
  }

  async getPlaylistSongs(id) {
    const queryPlaylist = await this._pool.query({
      text: `SELECT id, name FROM playlists WHERE id = $1`,
      values: [id],
    });

    const query = await this._pool.query({
      text: `SELECT s.id, s.title, s.performer
      FROM songs s 
      LEFT JOIN playlist_songs ps ON s.id = ps.song_id
      WHERE ps.playlist_id = $1`,
      values: [id],
    });

    const result = {
      playlist: {
        ...queryPlaylist.rows[0],
        songs: query.rows
      },
    };

    console.log(JSON.stringify(result));

    return result;
  }
}

module.exports = PlaylistService;
