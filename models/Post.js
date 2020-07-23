const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    onWall: {
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    text: {
        type: String,
        required: true
    },
    name: {
        type: String
    },
    avatar: {
        type: String
    },
    isShared: Boolean,
    parents: [{
        type: Schema.Types.ObjectId,
        ref: 'user'
    }],
    wallOwner: String,
    peopleTag: [],
    checkIn: String,
    postImg: [{
        imgLink: {
            type: String
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        },
        text: {
            type: String,
            required: true
        },
        name: {
            type: String
        },
        avatar: {
            type: String
        },
        date: {
            type: Date,
            default: Date.now
        }
    }],
    hashTag: [],
    likes: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: "user"
        }
    }],
    comments: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: "user"
        },
        text: {
            type: String,
            required: true
        },
        name: {
            type: String
        },
        avatar: {
            type: String
        },
        date: {
            type: Date,
            default: Date.now
        },
        postImg: [{
            imgLink: {
                type: String
            }
        }],
        likes: [{
            user: {
                type: Schema.Types.ObjectId,
                ref: "user"
            }
        }],
    }],
    date: {
        type: Date,
        default: Date.now
    }

})

module.exports = mongoose.model("post", PostSchema)