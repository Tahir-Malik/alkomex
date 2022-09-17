const bcrypt = require('bcrypt')

exports.encryptPassword = (password) => {
    const salt = bcrypt.genSaltSync()
    return bcrypt.hashSync(password, salt)
}

exports.comparePassword = (password, encodedPassword) => {
    return bcrypt.compareSync(password, encodedPassword)
}

