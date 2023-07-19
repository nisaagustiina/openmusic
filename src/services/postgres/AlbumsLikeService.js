const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumsLikeService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async getAlbumById(id) {
    const query = await this._pool.query({
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    });

    const querySong = await this._pool.query({
      text: 'SELECT songs.id, songs.title, songs.performer FROM songs INNER JOIN albums ON albums.id=songs."albumId" WHERE albums.id = $1',
      values: [id],
    });

    if (!query.rowCount) {
      throw new NotFoundError('Album tidak ditemukan. Id tidak ditemukan!');
    }

    return {
      ...query.rows[0],
      songs: querySong.rows,
    };
  }

  async addAlbumLikes(albumId, userId) {
    const id = `like-${nanoid(16)}`;

    await this.getAlbumById(albumId);

    await this._cacheService.delete(`album_likes:${albumId}`);
    const hasLiked = await this.verifyAlbumLikes(albumId, userId);

    if (hasLiked) {
      const query = {
        text: 'DELETE FROM user_album_likes WHERE album_id = $1 AND user_id = $2 RETURNING id',
        values: [albumId, userId],
      };

      const result = await this._pool.query(query);

      if (!result.rowCount) {
        throw new InvariantError('Dislike album gagal!');
      }

      return 'Dislike album berhasil!';
    }

    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Like album gagal!');
    }
    return 'Like album berhasil!';
  }

  async verifyAlbumLikes(albumId, userId) {
    const query = {
      text: 'SELECT id FROM user_album_likes WHERE album_id = $1 AND user_id = $2',
      values: [albumId, userId],
    };
    const result = await this._pool.query(query);

    if (result.rowCount) return true;
    return false;
  }

  async getAlbumLikes(albumId) {
    try {
      const result = await this._cacheService.get(`album_likes:${albumId}`);
      return { likes: +result, isCache: true };
    } catch (error) {
      const query = {
        text: 'SELECT COUNT(*) FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };
      const result = await this._pool.query(query);
      const likes = +result.rows[0].count;

      await this._cacheService.set(`album_likes:${albumId}`, likes);

      return { likes, isCache: false };
    }
  }
}
module.exports = AlbumsLikeService;
