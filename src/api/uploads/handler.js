const autoBind = require('auto-bind');

class UploadsHandler {
  constructor(service, storageService, validator) {
    this._service = service;
    this._storageService = storageService;
    this._validator = validator;

    autoBind(this);
  }

  async postUploadAlbumCoverHandler(request, h) {

    const { cover } = request.payload;
    const { id } = request.params;

    this._validator.validateImageHeaders(cover.hapi.headers);

    const filename = await this._storageService.writeFile(cover, cover.hapi);

    const fileLocation = `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`;

    await this._service.editAlbumCover(id, fileLocation);

    const response = h.response({
      status: 'success',
      message: 'Cover uploaded',
      data: {
        fileLocation,
      },
    });

    response.code(201);
    return response;
  }

}

module.exports = UploadsHandler;
