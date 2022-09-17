const jwt = require('jsonwebtoken')

const constants = require('../constants');

exports.signin = (payload) => {
    return jwt.sign(payload, constants.jwtSecret, { expiresIn: constants.tokenExpiresIn })
}
exports.verify = (token) => {
    const opt = Object.assign({}, options)
    return jwt.verify(token, constants.jwtSecret, opt)
}

