const sendgrid = require('@sendgrid/mail')


const sendEmail = ({to,subject,html}) => {
  sendgrid.setApiKey(process.env.SENDGRID)

    const newmsg = {
        to,
        from:'Marvelloussolomon49@gmail.com',
        subject,
        html
    }

    sendgrid.send(newmsg)
}



module.exports = sendEmail