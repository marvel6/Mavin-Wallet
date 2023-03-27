const jwt = require('jsonwebtoken')


const createJwtUser = async ({ payload }) => {
    const webtoken = jwt.sign(payload, process.env.JWT_SECRET)
    return webtoken;
}


const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET)




const attachCookiesToResponse = ({res,user,refreshToken}) => {
    const AccesstokenJWT = createJwtUser({payload:user})
    const refreshTokentokenJWT = createJwtUser({payload:user,refreshToken})

    const oneday = 1000 * 60 * 60 * 24
    const longterm = 1000 * 60 * 60 * 24 * 30

   
    res.cookie('accessToken',AccesstokenJWT,{
        httpOnly:true,
        secure:process.env.NODE_ENV === 'production',
        signed:true,
        expires:new Date(Date.now() + oneday)
    })


    res.cookie('refreshToken',refreshTokentokenJWT,{
        httpOnly:true,
        secure:process.env.NODE_ENV = 'production',
        signed:true,
        expires:new Date(Date.now() + longterm)
    })
}



module.exports = {
    attachCookiesToResponse,
    verifyToken
}