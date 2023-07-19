const autoBind = require('auto-bind');

class PlaylistsHandler {
  constructor(service, songsService, validator) {
    this._service = service;
    this._songsService = songsService;
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
      message: 'Playlist berhasil ditambahkan!',
      data: {
        playlistId,
      },
    });

    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request) {

    const { userId: owner } = request.auth.credentials;

    const playlists = await this._service.getPlaylists(owner);

    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async getPlaylistByIdHandler(request) {

    const { id } = request.params;
    const { userId: owner } = request.auth.credentials;

    await this._playlistService.verifyPlaylistAccess(id, owner);
    const playlist = await this._playlistService.getPlaylistById(id);

    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deletePlaylistByIdHandler(request) {
    const { id } = request.params;
    const { userId: owner } = request.auth.credentials;

    await this._service.verifyPlaylistOwner(id, owner);

    await this._service.deletePlaylistById(id);

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus!',
    };
  }

  async postSongToPlaylistHandler(request, h) {
    this._validator.validatePlaylistSongPayload(request.payload);

    const { id: playlistId } = request.params;
    const { songId } = request.payload;
    const { userId } = request.auth.credentials;

    await this._service.verifyPlaylistAccess(playlistId, userId);
    await this._songsService.getSongById(songId);
    await this._playlistService.addSongToPlaylist(playlistId, songId);
    await this._playlistService.addPlaylistActivity(
      playlistId,
      songId,
      userId,
      'add',
    );

    const response = h.response({
      status: 'success',
      message: 'Song berhasil ditambahkan ke playlist!',
    });

    response.code(201);
    return response;

  }

  async getPlaylistSongsHandler(request) {
    const { id } = request.params;
    const { userId } = request.auth.credentials;

    await this._service.verifyPlaylistAccess(id, userId);

    const playlist = await this._service.getPlaylistSongs(id);

    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deleteSongFromPlaylistHandler(request) {
    this._validator.validatePlaylistSongPayload(request.payload);

    const { id: playlistId } = request.params;
    const { userId } = request.auth.credentials;
    const { songId } = request.payload;

    await this._playlistService.verifyPlaylistAccess(playlistId, userId);
    await this._playlistService.deleteSongFromPlaylist(playlistId, songId);
    await this._playlistService.addPlaylistActivity(
      playlistId,
      songId,
      userId,
      'delete',
    );

    return {
      status: 'success',
      message: 'Playlist Song berhasil dihapus!',
    };
  }

  async getPlaylistActivitiesHandler(request) {
    const { id: playlistId } = request.params;
    const { userId } = request.auth.credentials;

    await this._playlistService.verifyPlaylistAccess(playlistId, userId);

    const activities = await this._playlistService.getPlaylistActivity(playlistId);

    return {
      status: 'success',
      data: {
        playlistId,
        activities,
      },
    };
  }

}

module.exports = PlaylistsHandler;
