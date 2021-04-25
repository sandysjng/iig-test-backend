const jwt = require('jsonwebtoken'),
    secret = require('../config').secret;

exports.required = async (req, res, next) => {
    if (req.headers['authorization'] === undefined ||
        req.headers['authorization'].split(' ')[1] === undefined) {
        return res.sendStatus(401)
    }

    jwt.verify(req.headers['authorization'].split(' ')[1], secret, async (error) => {
        if (error) return res.sendStatus(401)

        next()
    })
}