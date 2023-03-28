const tokenModel = require('../models/token')
const response = require('../responses/response')
const { verifyToken, attachCookiesToResponse } = require('../utils/Jutils')
const { StatusCodes } = require('http-status-codes')



const authenticateUser = async (req, res, next) => {
    const { accessToken, refreshToken } = req.signedCookies

    try {

        if (accessToken) {
            const payload = verifyToken(accessToken)

            if (!payload) {
                res.status(StatusCodes.UNAUTHORIZED).json(response({
                    data: 'user payload credentials not found',
                    status: StatusCodes.UNAUTHORIZED
                }))
            }

            req.user = payload.user


            return next();
        }


        const payload = verifyToken(refreshToken)

        const token = await tokenModel.findOne({
            user: payload.user.userId,
            refreshToken: payload.refreshToken
        })


        if (!token && !token?.isValid) {

            res.status(StatusCodes.UNAUTHORIZED).json(response({
                data: 'user refreshtoken credentials not found',
                status: StatusCodes.UNAUTHORIZED
            }))

        }

        attachCookiesToResponse({ res, user: payload.user, refreshToken: payload.refreshToken })

        req.user = payload.user

        next()

    } catch (error) {
        res.json(response({ status: StatusCodes.INTERNAL_SERVER_ERROR, data: 'INTERNAL_SERVER_ERROR', }))
    }
}

const checkPermision = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            res.status(StatusCodes.UNAUTHORIZED).json(response({
                data: 'You are not authorized to access this route',
                status: StatusCodes.UNAUTHORIZED
            }))

        }
        next()
    }
}



module.exports = {
    authenticateUser,
    checkPermision
}