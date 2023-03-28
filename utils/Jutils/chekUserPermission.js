const { StatusCodes } = require('http-status-codes')

const checkPermission = (reqUser, reqUserId) => {

    if (reqUser.role === "admin") return
    if (reqUser.userId === reqUserId.toString()) return

    res.status(StatusCodes.UNAUTHORIZED).json(response({
        data: `You are not authorized to access this route`,
        status: StatusCodes.UNAUTHORIZED
    }))
}


module.exports = { checkPermission }