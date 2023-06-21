const autoBind = require('auto-bind');

class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);

    const { name } = request.payload;
    const { userId: owner } = request.auth.credentials;

    const playlistId = await this._service.addPlaylist({ name, owner });

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

    const { userId: owner } = request.auth.credentials;

    const playlists = await this._service.getPlaylist({ owner });

    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistHandler(request) {
    const { id } = request.params;
    const { userId: owner } = request.auth.credentials;

    await this._service.verifyPlaylistOwner({ id, owner });

    await this._service.deletePlaylistById(id);

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async postPlaylistSongHandler(request, h) {
    this._validator.validatePlaylistSongPayload(request.payload);

    const { id: playlistId } = request.params;
    const { songId } = request.payload;
    const { userId } = request.auth.credentials;

    await this._service.verifyPlaylistAccess({ playlistId, userId });
    await this._service.addPlaylistSong({ playlistId, songId, userId });

    const response = h.response({
      status: 'success',
      message: 'Song berhasil ditambahkan',
    });

    response.code(201);
    return response;
  }

  async getPlaylistSongHandler(request) {
    const { id } = request.params;
    const { userId } = request.auth.credentials;

    await this._service.verifyPlaylistAccess({ playlistId: id, userId });

    const playlist = await this._service.getPlaylistSongById(id);

    return {
      status: 'succes',
      data: {
        playlist,
      },
    };
  }

  async deletePlaylisSongtHandler(request) {
    this._validator.validatePlaylistSongPayload(request.payload);

    const { id: playlistId } = request.params;
    const { userId } = request.auth.credentials;
    const { songId } = request.payload;

    await this._service.verifyPlaylistAccess({ playlistId, userId });
    await this.service.eletePlaylistSongById({ playlistId, songId, userId });

    return {
      status: 'success',
      message: 'Song berhasil dihapus',
    };
  }

}

module.exports = PlaylistsHandler;
