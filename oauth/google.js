var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

module.exports = new GoogleStrategy({
        clientID: "412568118809-86lbf4jn6jhfg513iuso9vctt9o5k1c4.apps.googleusercontent.com",
        clientSecret: "_MpwjTpCbF_jUYuH1oDYFwTk",
        callbackURL: "https://localhost:5000/api/auth/gmail/authorized"

    },
    function(accessToken, refreshToken, profile, next) {
        next(null, profile)
    }
)