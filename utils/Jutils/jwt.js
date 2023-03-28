const jwt = require('jsonwebtoken')


const createJwtUser = async ({ payload }) => {
    const webtoken = jwt.sign(payload, process.env.JWT_SECRET)

    return webtoken;
}


const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET)




const attachCookiesToResponse = ({ res, user, refreshToken }) => {
    const accessTokenJWT = createJwtUser({ payload: { user } })
    const refreshTokenJWT = createJwtUser({ payload: { user, refreshToken } })



    const accessTime = 1000 * 60 * 60 * 24
    const refreshTime = 1000 * 60 * 60 * 24 * 30



    res.cookie('accessToken', accessTokenJWT, {
        httpOnly: true,
        expires: new Date(Date.now() + accessTime),
        signed: true,
        secure: process.env.NODE_ENV === 'production'

    })


    res.cookie('refreshToken', refreshTokenJWT, {
        httpOnly: true,
        expires: new Date(Date.now() + refreshTime),
        signed: true,
        secure: process.env.NODE_ENV === 'production'
    })
}



module.exports = {
    attachCookiesToResponse,
    verifyToken
}