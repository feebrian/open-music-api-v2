const InvariantError = require('../../exceptions/InvariantError');
const { ExportSongsPayloadSchema } = require('./schema');

const ExportPlaylistValidator = {
  validateExportPlaylistPayload: (payload) => {
    const validationResult = ExportSongsPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = ExportPlaylistValidator;
