const autoBind = require('auto-bind');

class ExportsHandler {
  constructor(service, playlistsService, validator) {
    this._service = service;
    this._playlistsService = playlistsService;
    this._validator = validator;

    autoBind(this);
  }

  async postExportHandler(request, h) {
    this._validator.validateExportPayload(request.payload);

    const { playlistId } = request.params;
    const { targetEmail } = request.payload;
    const { userId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner({ id: playlistId, owner: userId });

    const message = {
      targetEmail,
      playlistId,
    };

    await this._service.sendMessage('export:playlists', JSON.stringify(message));

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses',
    });

    response.code(201);
    return response;
  }

}

module.exports = ExportsHandler;
