const createUser = (user) => {
    return { name: user.username, userId: user._id, role: user.role }

}


module.exports = createUser 