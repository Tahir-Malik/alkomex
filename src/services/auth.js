const { Fail } = require('../../services/response')
const { verify } = require('./jwt')

exports.authenticate = (req, res, next) => {
    var token = req.headers['authenticate'];
    if (!token)
        res.json(Fail('No token provided.'))
    else {
        try {
            var decoded = verify(token)
            req.decoded = decoded;
            next();
        } catch (err) {
            req.decoded = undefined
            res.json(Fail('Failed to authenticate token.'))
        }
    }
}

