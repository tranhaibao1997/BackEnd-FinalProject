const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "User must have a name"],
        trim: true,
        minLength: 3
    },
    lastName: {
        type: String,
        required: [true, "User must have a name"],
        trim: true,
        minLength: 3
    },
    email: {
        type: String,
        required: [true, "User must have an email"],
        trim: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,

    },
    avatar: {
        type: String,
        default: "https://futbolita.com/wp-content/uploads/2008/11/avatar-1577909_960_720.png"

    },
    banner: {
        type: String,
        default: "https://versohydraulic.com/bitrix/templates/aspro-scorp/images/default-banner.jpg"
    },
    dob: {
        type: Date,
        // required: [true, "Must enter your day of birth"]
    },
    gender: {
        type: String,
    },
    location: {
        longtitude: {
            type: String,
            default: "0"
        },
        latitude: {
            type: String,
            default: "0"
        },
    },
    tokens: [{
            type: String
        }] // array of tokens
}, {
    timestamps: true
})


userSchema.methods.generateToken = async function() {
    let user = this;
    let mySecretPassword = "samsamdendayanne"
    let token = jwt.sign({ _id: user._id }, mySecretPassword, { expiresIn: "7d" })
    user.tokens.push(token)
    await user.save()
    return token

}



//statis is for User

userSchema.statics.comparePassword = async function(email, password) {
    try {
        let user = await User.findOne({ email: email })
        if (!user) {
            //dont need to send, just throw Error
            throw new Error("Cant not find the user")
        }

        const isMatch = await bcrypt.compare(password, user.password)


        if (!isMatch) {
            throw new Error("Wrong password, please provide a new one")
        }
        return user

    } catch (err) {
        return err.message
    }


}

//methods is for user // pre is a middlware that's why we need to pass next into the function
userSchema.pre("save", async function(next) {

    const user = this;
    if (user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    console.log("before saving")
    next();
})

let User = mongoose.model("user", userSchema)

// inside methods , "this" will refer to the instance

//inside statics, "this" will refer to the class

//const obj=new Person({name:"khoa",age"32"})

//obj => {name:"Khoa,age:32"} ==> instance of Person class


module.exports = User