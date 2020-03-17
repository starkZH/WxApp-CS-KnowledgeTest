const jwt = require('jsonwebtoken');
const secret = 'dhsajdhqwuiyr8193721893yhwiehqwk';
const Token = {
  encrypt: function (data, time) { //data加密数据，time过期时间
    return jwt.sign(data, secret, { expiresIn: time })
  },
  decrypt: function (token) {
    try {
      let data = jwt.verify(token, secret);
      return {
        valid: true,
        data: data
      };
    } catch (e) {
      return {
        valid: false,
      }
    }
  }
}
module.exports = Token;