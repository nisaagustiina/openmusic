const autoBind = require('auto-bind');

class AlbumLikesHandler {
  constructor(service) {
    this._service = service;

    autoBind(this);
  }

  async postLikeByIdHandler(request, h) {
    const { id } = request.params;
    const { userId } = request.auth.credentials;
    await this._service.verifyUserLiked(id, userId);

    await this._service.addLikeToAlbum(id, userId);

    const response = h.response({
      status: 'success',
      message: 'Anda menyukai album ini',
    });
    response.code(201);
    return response;
  }

  async deleteLikeByIdHandler(request) {
    const { id } = request.params;
    const { userId } = request.auth.credentials;

    await this._service.deleteLike(id, userId);
    return {
      status: 'success',
      message: 'Berhasil membatalkan like',
    };
  }

  async getLikesByIdHandler(request, h) {
    const { id: albumId } = request.params;
    const { likes, cached } = await this._service.getAlbumLikes(albumId);
    const response = h.response({
      status: 'success',
      data: {
        likes,
      },
    });
    if (cached) {
      response.header('X-Data-Source', 'cache');
    }
    return response;
  }

}

module.exports = AlbumLikesHandler;
