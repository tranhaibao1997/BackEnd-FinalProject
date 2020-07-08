const jwt = require("jsonwebtoken")
const User = require("../models/User")

async function auth(req, res, next) {
    console.log("da zo")
    try {
        const token = req.header('Authorization').replace('Bearer ', "")

        const decode = jwt.verify(token, "samsamdendayanne");

        const user = await User.findOne({ _id: decode._id, tokens: token })
        if (!user) {
            throw new Error("Cant not find the user")
        }
        req.user = user

        next();

    } catch (err) {
        console.log(err)
        res.status(401).send({ err: 'Please authenticate' })
    }
}

async function authHost(req, res, next) {
    if (req.user.type !== "host") {
        return res.status(401).json({ status: "You are not the host" })
    }
    next();
}
module.exports = { auth, authHost }