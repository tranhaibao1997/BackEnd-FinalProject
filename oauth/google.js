var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
require("dotenv").config({ path: ".env" })


module.exports = new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "https://backend-final-project-haibao.herokuapp.com/api/auth/gmail/authorized"

    },
    function(accessToken, refreshToken, profile, next) {
        next(null, profile)
    }
)