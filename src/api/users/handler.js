class UsersHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }

  async postUserHandler(req, h) {
    this._validator.validateUserPayload(req.payload);

    const { username, password, fullname } = req.payload;
    await this._service.verifyNewUsername(username);

    const userId = await this._service.addUser({ username, password, fullname });

    const res = h.response({
      status: 'success',
      data: {
        userId,
      },
    });
    res.code(201);
    return res;
  }
}

module.exports = UsersHandler;
