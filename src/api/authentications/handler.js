class AuthenticationsHandler {
  constructor(authenticationsService, usersService, tokenManager, validator) {
    this._authenticationsService = authenticationsService;
    this._usersService = usersService;
    this._tokenManager = tokenManager;
    this._validator = validator;
  }

  async postAuthenticationHandler(req, h) {
    this._validator.validatePostAuthenticationPayload(req.payload);

    const { username, password } = req.payload;
    const userId = await this._usersService.verifyUserCredentials(username, password);

    const accessToken = await this._tokenManager.generateAccessToken({ userId });
    const refreshToken = await this._tokenManager.generateRefreshToken({ userId });
    await this._authenticationsService.addRefreshToken(refreshToken);

    const res = h.response({
      status: 'success',
      data: {
        accessToken,
        refreshToken,
      },
    });
    res.code(201);
    return res;
  }

  async putAuthenticationHandler(req) {
    this._validator.validatePutAuthenticationPayload(req.payload);
    const { refreshToken } = req.payload;

    await this._authenticationsService.verifyRefreshToken(refreshToken);
    const userId = this._tokenManager.verifyRefreshToken(refreshToken);

    const accessToken = this._tokenManager.generateAccessToken({ userId });

    return {
      status: 'success',
      data: {
        accessToken,
      },
    };
  }

  async deleteAuthenticationHandler(req) {
    this._validator.validateDeleteAuthenticationPayload(req.payload);
    const { refreshToken } = req.payload;

    await this._authenticationsService.verifyRefreshToken(refreshToken);
    await this._authenticationsService.deleteRefreshToken(refreshToken);

    return {
      status: 'success',
      message: 'Refresh token berhasil dihapus',
    };
  }
}

module.exports = AuthenticationsHandler;
