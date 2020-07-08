const mongoose = require('mongoose')

const ProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'user'
    },
    aboutMe: {
        type: String
    },

    livesIn: {
        type: String
    },
    birthPlace: {
        type: String
    },
    occupation: {
        type: String
    },
    status: {
        type: String
    },
    phoneNumber: String,
    personalWebsite: String,
    friendList: [{
        friendId: {
            type: mongoose.Schema.ObjectId,
            ref: "profile"
        }

    }],
    joinDay: {
        type: Date,
        default: Date.now()
    },
    sendFriendRequest: [{
        friendId: {
            type: mongoose.Schema.ObjectId,
            ref: "profile"
        }
    }],
    recieveFriendRequest: [{
        friendId: {
            type: mongoose.Schema.ObjectId,
            ref: "profile"
        }
    }],
    follower: [{
        friendId: {
            type: mongoose.Schema.ObjectId,
            ref: "profile"
        }
    }],
    following: [{
        friendId: {
            type: mongoose.Schema.ObjectId,
            ref: "profile"
        }
    }],
    activities: [{
        activityId: mongoose.Schema.ObjectId
    }],
    skill: {
        type: [String]
    },
    social: {
        phone: {
            type: Number
        },
        email: {
            type: String
        },
        website: {
            type: String
        },
    },
    experience: [{
        jobTitle: {
            type: String
        },
        company: {
            type: String,
            required: true
        },
        location: {
            type: String
        },
        from: {
            type: Date,
            required: true
        },
        to: {
            type: Date
        },
        current: {
            type: Boolean,
            default: false
        },
        description: {
            type: String
        }
    }],

    education: [{
        school: String,
        degree: String,
        fieldOfStudy: String,
        fromDate: Date,
        current: Boolean,
        toDate: Date,
        description: String,
    }],
    allHobbies: {
        hobbies: String,
        favoriteTVShow: String,
        favoriteMovies: String,
        favoriteGames: String,
        favoriteMusicBand: String,
        favoriteBooks: String,
        favoriteWriters: String,
        otherInterests: String
        
    },
    post: [Object]




})

let Profile = mongoose.model("profile", ProfileSchema)
module.exports = Profile