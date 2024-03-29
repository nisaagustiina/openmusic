const UploadsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'uploads',
  version: '3.0.0',
  register: async (server, { service, storageService, validator }) => {
    const uploadsHandler = new UploadsHandler(service, storageService, validator);
    server.route(routes(uploadsHandler));
  },
};
