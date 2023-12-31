const InvariantError = require('../../exceptions/InvariantError');
const { playlistPayloadSchema, postSongToPlaylistSchema, deleteSongFromPlaylistSchema } = require('./schema');

const PlaylistsValidator = {
  validatePlaylistPayload: (payload) => {
    const validationResult = playlistPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validatePostSongToPlaylistPayload: (payload) => {
    const validationResult = postSongToPlaylistSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validateDeleteSongFromPlaylistPayload: (payload) => {
    const validationResult = deleteSongFromPlaylistSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = PlaylistsValidator;
