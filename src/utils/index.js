/* eslint-disable object-curly-newline */
/* eslint-disable max-len */
/* eslint-disable no-trailing-spaces */
/* eslint-disable camelcase */
const mapAlbumsModel = ({
  id,
  name,
  year,
  cover,
}) => ({
  id,
  name,
  year,
  coverUrl: cover,
});

const mapSongsModel = ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId,
}) => ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId,
});

const mapPlaylistsModel = ({
  id,
  name,
  owner,
}) => ({
  id,
  name,
  username: owner,
});

module.exports = { mapAlbumsModel, mapSongsModel, mapPlaylistsModel };
