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
        type: mongoose.Schema.ObjectId,
        ref: "user"
    }],
    joinDay: {
        type: Date,
        default: Date.now()
    },
    friendRequestSent: [{
        type: mongoose.Schema.ObjectId,
        ref: "user"
    }],
    friendRequestPending: [{
        type: mongoose.Schema.ObjectId,
        ref: "user"
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
        company: String,
        jobTitle: String,
        location: String,
        fromDate: Date,
        current: Boolean,
        toDate: Date,
        description: String,
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
    uploadedImages: []




})

let Profile = mongoose.model("profile", ProfileSchema)
module.exports = Profile