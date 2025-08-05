const jwt = require('jsonwebtoken');
const moment = require('moment');
const { tokenTypes } = require('../config/tokens');

class TokenService {
  /**
   * Generate token
   * @param {ObjectId} userId
   * @param {Moment} expires
   * @param {string} type
   * @param {string} [secret]
   * @returns {string}
   */
  generateToken(userId, expires, type, secret = process.env.JWT_SECRET) {
    const payload = {
      sub: userId,
      iat: moment().unix(),
      exp: expires.unix(),
      type,
    };
    return jwt.sign(payload, secret);
  }

  /**
   * Generate auth tokens
   * @param {User} user
   * @returns {Promise<Object>}
   */
  async generateAuthTokens(user) {
    const accessTokenExpires = moment().add(process.env.JWT_ACCESS_EXPIRATION_MINUTES, 'minutes');
    const accessToken = this.generateToken(user.id, accessTokenExpires, tokenTypes.ACCESS);

    return {
      access: {
        token: accessToken,
        expires: accessTokenExpires.toDate(),
      },
    };
  }
}

module.exports = TokenService;