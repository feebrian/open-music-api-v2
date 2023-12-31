const Joi = require('joi');

const playlistPayloadSchema = Joi.object({
  name: Joi.string().required(),
});

const postSongToPlaylistSchema = Joi.object({
  songId: Joi.string().required(),
});

const deleteSongFromPlaylistSchema = Joi.object({
  songId: Joi.string().required(),
});

module.exports = {
  playlistPayloadSchema,
  postSongToPlaylistSchema,
  deleteSongFromPlaylistSchema,
};
