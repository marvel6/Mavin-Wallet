const sendEmail = require('./sendEmail')


const sendVerificationEmail = ({ name, email, origin, verificationToken }) => {

    const verifyEmail = `${origin}/user/verify-email?token=${verificationToken}&email=${email}`

    const msg = `<p> please verify your email account link: <a href = "${verifyEmail}">Verify Email</a></p>`

    return sendEmail({ to: email, subject: "Email Verification", html: `<Hello ${name}  ${msg}` })
}


const deviceChangedEmail = ({ name, email }) => {
    const msg = `<p> Your account has been accessed with another device.If you did not perform this action, please contact us immediately</p>`

    return sendEmail({ to: email, subject: 'Detected device change', html: `hello ${name}, ${msg}` })

}


module.exports = { sendVerificationEmail, deviceChangedEmail }