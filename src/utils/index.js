/* eslint-disable object-curly-newline */
/* eslint-disable max-len */
/* eslint-disable no-trailing-spaces */
/* eslint-disable camelcase */
const mapAlbumsModel = ({
  id,
  name,
  year,
}) => ({
  id,
  name,
  year,
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

module.exports = { mapAlbumsModel, mapSongsModel };
