const passportFacebook = require('passport-facebook')
const Strategy = passportFacebook.Strategy
require("dotenv").config({ path: ".env" })

module.exports = new Strategy({
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: "https://backend-final-project-haibao.herokuapp.com/api/auth/facebook/authorized",
        profileFields: ["id", "email", "name"]
    },
    function(accessToken, refreshToken, profile, next) {
        next(null, profile)
    }
)