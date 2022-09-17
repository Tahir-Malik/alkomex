const { assoc } = require('ramda')

exports.Success = (data, message) => {
    return assoc(
        'data',
        data,
        defaultResponse(true, message)
    )
}

exports.Fail = (data) => {
    return assoc(
        'message',
        data,
        defaultResponse(false)
    )
}


const defaultResponse = (success = true, message) => {
    return {
        success,
        date: new Date(),
        message: message
    }
}