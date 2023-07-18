const routes = (handler) => [
  {
    method: 'POST',
    path: '/export/playlists/{playlistId}',
    handler: handler.postExportHandler,
    options: {
      auth: 'openmusic_jwt',
    },
  },
];

module.exports = routes;
