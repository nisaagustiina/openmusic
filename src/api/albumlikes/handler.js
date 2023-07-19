const autoBind = require('auto-bind');

class AlbumLikesHandler {
  constructor(service) {
    this._service = service;

    autoBind(this);
  }

  async postAlbumLikesHandler(request, h) {
    const { userId } = request.auth.credentials;
    const { id } = request.params;

    const message = await this._service.addAlbumLikes(id, userId);

    const response = h.response({
      status: 'success',
      message,
    });

    response.code(201);
    return response;
  }

  async getAlbumLikesHandler(request, h) {
    const { id } = request.params;
    const { likes, isCache } = await this._service.getAlbumLikes(id);
    return h
      .response({
        status: 'success',
        data: {
          likes,
        },
      })
      .header('X-Data-Source', isCache ? 'cache' : 'db');
  }

}

module.exports = AlbumLikesHandler;
