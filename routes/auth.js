var express = require('express');
var router = express.Router();
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middlewares/auth');
const passport = require('../oauth/index');



//Login 
router.post("/login", async (req, res, next) => {
    let { email, password } = req.body
    try {
        let user = await User.comparePassword(email, password)
        let token = await user.generateToken()
        console.log(token)
        res.send({
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                token: token


            },
            message: "Success"
        })
    } catch (err) {
        res.send(err)
    }
})

//Get current user
router.get("/me", auth, async (req, res, next) => {
    res.send(req.user)
})


//change password
router.patch("/changePassword", auth, async (req, res, next) => {
    try {
        let { newPassword } = req.body
        let user = req.user
        user.password = newPassword
        user.tokens = []
        await user.save()
        res.status(201).send({
            data: user,
            message: "change password successfully"
        })
    } catch (err) {
        res.status(400).send({
            errors: err,
            message: "Cant not change the password"
        })
    }



})

//log out
router.get("/logOut", auth, async (req, res, next) => {
    try {
        let user = req.user
        user.tokens.splice(user.tokens.length - 1, 1)
        await user.save()
    } catch (err) {

    }
})

router.get("/facebook/login", passport.authenticate("facebook", { scope: ['email'] }))

router.get("/facebook/authorized", (req, res, next) => {

    console.log("Dung link roi")
    passport.authenticate("facebook", async function (err, profile) {
        try {
            const { email, last_name, first_name } = profile._json
            let user = await User.findOne({ email })
            if (!user) {
                user = new User({
                    email: email,
                    firstName: first_name,
                    lastName: last_name,

                })
                await user.save()

            }
            const token = await user.generateToken()
            return res.redirect(`http://localhost:3000/dashboard/personal?token=${token}`)
        } catch (err) {
            res.send(err)
        }


    })(req, res, next)
})

router.get("/gmail/login", passport.authenticate('google', {
    scope: ['https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email']
}))




router.get("/gmail/authorized", (req, res, next) => {

    console.log("Dung link roi")
    passport.authenticate("google", async function (err, profile) {
        
        try {
            const { email, given_name, family_name } = profile._json
            let user = await User.findOne({ email })
            if (!user) {
                user = new User({
                    email: email,
                    firstName: given_name,
                    lastName: family_name,

                })
                await user.save()

            }
            const token = await user.generateToken()
            return res.redirect(`http://localhost:3000/dashboard/personal?token=${token}`)
        } catch (err) {
            res.send(err)
        }


    })(req, res, next)
})


module.exports = router;