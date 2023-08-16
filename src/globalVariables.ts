// secret string that is used to hash JWT
module.exports.secretString = "A secret string, it is not to be shared with anyone!!!"

// how many times we want to hash the password (it will hash 10^saltrounds times)
module.exports.saltrounds = 14

// maximum age that JWT can live for (in seconds) - it determines the maximum lenght of session
module.exports.maxTokenAge = 60 * 30;