const generateCodeUnique = () => {
    const array = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    const generateCode = shuffle(array)

    return generateCode.slice(0, 6).join('')
}


const shuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
}

module.exports = { generateCodeUnique }

