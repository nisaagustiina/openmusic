const autoBind = require('auto-bind');

class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);

    await this._service.verifyPlaylistAccess(request.payload);

    const playlistId = await this._service.addPlaylist(request.payload);

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId,
      },
    });

    response.code(201);
    return response;
  }

  async getPlaylistHandler(request) {
    await this._service.verifyPlaylistAccess(request.payload);

    const playlist = await this._service.getPlaylist();
    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deletePlaylistHandler(request) {
    const { id } = request.params;
    await this._service.verifyPlaylistAccess(request.payload);

    await this._service.deletePlaylistById(id);

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async getPlaylistSongHandler(request) {
    const { id } = request.params;

    await this._service.verifyPlaylistAccess(request.payload);

    const playlist = await this._service.getPlaylistSongById(id);

    return {
      status: 'succes',
      data: {
        playlist,
      },
    };
  }

  async postPlaylistSongHandler(request, h) {
    this._validator.validatePlaylistSongPayload(request.payload);

    await this._service.verifyPlaylistAccess(request.payload);
    await this._service.addPlaylistSong(request.payload);

    const response = h.response({
      status: 'success',
      message: 'Song berhasil ditambahkan',
    });

    response.code(201);
    return response;
  }

  async deletePlaylisSongtHandler(request) {
    this._validator.validatePlaylistSongPayload(request.payload);

    await this._service.verifyPlaylistAccess(request.payload);
    await this.service.eletePlaylistSongById(request.payload);

    return {
      status: 'success',
      message: 'Song berhasil dihapus',
    };
  }

}

module.exports = PlaylistsHandler;
