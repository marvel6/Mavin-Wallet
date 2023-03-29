const moment = require('moment')


const currentTime = (date) => {

    const now = moment()

    now.format('MMMM D, YYYY h:mm A')

    return now;
}


module.exports = { currentTime }