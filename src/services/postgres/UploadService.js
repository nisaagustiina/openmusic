const { Pool } = require('pg');

const NotFoundError = require('../../exceptions/NotFoundError');

class UploadsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async editAlbumCover(id, cover) {
    const query = {
      text: 'UPDATE albums SET cover = $1 WHERE id = $2 RETURNING id',
      values: [cover, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError(
        'Cover Album gagal diperbarui. Id tidak ditemukan!',
      );
    }
  }
}
module.exports = UploadsService;
