const sendEmail = require('./sendEmail')


const sendVerificationEmail = ({ name, email, origin, verificationToken }) => {

    const verifyEmail = `${origin}/user/verify-email?token=${verificationToken}&email=${email}`

    const msg = `<p> please verify your email account link: <a href = "${verifyEmail}">Verify Email</a></p>`

    return sendEmail({ to: email, subject: "Email Verification", html:`<Hello ${name}  ${msg}` })
}


module.exports = {sendVerificationEmail}