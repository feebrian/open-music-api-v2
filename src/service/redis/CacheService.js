// eslint-disable-next-line import/no-extraneous-dependencies
const redis = require('redis');
const config = require('../../utils/config');

class CacheService {
  constructor() {
    this._client = redis.createClient({
      socket: {
        host: config.redis.host,
      },
    });

    this._client.on('error', (error) => console.error(error));

    this._client.connect();
  }

  async set(key, value, expirationSecond = 1800) {
    await this._client.set(key, value, {
      EX: expirationSecond,
    });
  }

  async get(key) {
    const result = await this._client.get(key);

    if (result === null) throw new Error('Cache tidak ditemukan');

    return result;
  }

  async delete(key) {
    return this._client.del(key);
  }
}

module.exports = CacheService;
