const Token = require('../models/token')
const { response } = require('../responses/response')
const { verifyToken, attachCookiesToResponse } = require('../utils/Jutils')
const { StatusCodes } = require('http-status-codes')



const authenticateUser = async (req, res, next) => {

    const { refreshToken, accessToken } = req.signedCookies;

    try {

        if (accessToken) {
            const payload = verifyToken(accessToken);

            if (!payload) {

                res.status(StatusCodes.UNAUTHORIZED).json(response({
                    data: 'You are not authorized to access this route',
                    status: StatusCodes.UNAUTHORIZED
                }))

            }
            req.user = payload.user;
            return next();
        }
        const payload = verifyToken(refreshToken);

        const existingToken = await Token.findOne({
            user: payload.user.userId,
            refreshToken: payload.refreshToken,
        });

        if (!existingToken || !existingToken?.isValid) {
            res.status(StatusCodes.UNAUTHORIZED).json(response({
                data: 'You are not authorized to acess this route',
                status: StatusCodes.UNAUTHORIZED
            }))

        }

        attachCookiesToResponse({
            res,
            user: payload.user,
            refreshToken: existingToken.refreshToken,
        });

        req.user = payload.user;
        next();
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json(response({
            data: 'INTERNAL_SERVER_ERROR',
            status: StatusCodes.BAD_REQUEST
        }))
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