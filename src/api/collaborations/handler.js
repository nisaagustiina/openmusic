const autoBind = require('auto-bind');

class CollaborationsHandler {
  constructor(collaborationsService, playlistService, validator) {
    this._service = collaborationsService;
    this._playlistService = playlistService;
    this._validator = validator;

    autoBind(this);
  }

  async postCollaborationHandler(request, h) {
    this._validator.validateCollaborationPayload(request.payload);

    const { playlistId, userId } = request.payload;
    const { id: owner } = request.auth.credentials;

    await this._playlistService.verifyPlaylistAccess({
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
    const { id: owner } = request.auth.credentials;

    await this._playlistService.verifyPlaylistOwner({
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
