const passportFacebook = require('passport-facebook')
const Strategy = passportFacebook.Strategy

module.exports = new Strategy({
        clientID: "706084776845167",
        clientSecret: "f8a83927dd60098219735a77e009bae2",
        callbackURL: "https://localhost:5000/api/auth/facebook/authorized",
        profileFields: ["id", "email", "name"]
    },
    function(accessToken, refreshToken, profile, next) {
        next(null, profile)
    }
)