const autoBind = require('auto-bind');

class PlaylistsHandler {
  constructor(playlistsService, playlistSongsService, psaService, validator) {
    this._service = playlistsService;
    this._playlistSongsService = playlistSongsService;
    this._psaService = psaService;
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

  async getPlaylistsHandler(request) {

    const { userId: owner } = request.auth.credentials;

    const playlists = await this._service.getPlaylists({ owner });

    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistByIdHandler(request) {
    const { id } = request.params;
    const { userId: owner } = request.auth.credentials;

    await this._service.verifyPlaylistOwner({ id, owner });

    await this._service.deletePlaylistById({ id });

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
    await this._playlistSongsService.addPlaylistSong({ playlistId, songId, userId });

    const response = h.response({
      status: 'success',
      message: 'Playlist Song berhasil ditambahkan',
    });

    response.code(201);
    return response;

  }

  async getPlaylistByIdHandler(request) {
    const { id } = request.params;
    const { userId } = request.auth.credentials;

    await this._service.verifyPlaylistAccess({ playlistId: id, userId });

    const playlist = await this._service.getPlaylistById({ id });

    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deletePlaylistSongByIdHandler(request) {
    this._validator.validatePlaylistSongPayload(request.payload);

    const { id: playlistId } = request.params;
    const { userId } = request.auth.credentials;
    const { songId } = request.payload;

    await this._service.verifyPlaylistAccess({ playlistId, userId });
    await this._playlistSongsService.deletePlaylistSongById({ playlistId, songId, userId });

    return {
      status: 'success',
      message: 'Playlist Song berhasil dihapus',
    };
  }

  async getPlaylistActivitiesByIdHandler(request) {
    const { id: playlistId } = request.params;
    const { userId } = request.auth.credentials;

    await this._service.verifyPlaylistAccess({ playlistId, userId });

    const activities = await this._psaService.getActivitiesByPlaylistId({
      playlistId,
    });

    return {
      status: 'success',
      data: {
        activities,
      },
    };
  }

}

module.exports = PlaylistsHandler;
