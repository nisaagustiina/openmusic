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

const filterTitleSongByParam = (song, title) => song.title.toLowerCase().includes(title);
const filterPerformerSongByParam = (song, performer) => song.performer.toLowerCase().includes(performer);

module.exports = { mapAlbumsModel, mapSongsModel, filterTitleSongByParam, filterPerformerSongByParam };
