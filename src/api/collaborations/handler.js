const autoBind = require('auto-bind');

class CollaborationsHandler {
  constructor(collaborationsService, playlistsService, validator) {
    this._service = collaborationsService;
    this._playlistsService = playlistsService;
    this._validator = validator;

    autoBind(this);
  }

  async postCollaborationHandler(request, h) {
    this._validator.validateCollaborationPayload(request.payload);

    const { playlistId, userId } = request.payload;
    const { userId: owner } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess({
      playlistId, userId: owner,
    });

    const collaborationId = await this._service.addCollaboration({
      playlistId, userId,
    });

    const response = h.response({
      status: 'success',
      message: 'Collaboration berhasil ditambahkan',
      data: {
        collaborationId,
      },
    });

    response.code(201);
    return response;
  }

  async deleteCollaborationHandler(request) {
    this._validator.validateCollaborationPayload(request.payload);

    const { playlistId, userId } = request.payload;
    const { userId: owner } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner({
      owner, id: playlistId,
    });

    await this._service.deleteCollaboration({
      playlistId, userId,
    });

    return {
      status: 'success',
      message: 'Collaboration berhasil dihapus',
    };
  }

}

module.exports = CollaborationsHandler;
