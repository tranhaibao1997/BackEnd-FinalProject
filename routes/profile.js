var express = require('express');
var router = express.Router();
const bcrypt = require('bcryptjs')
const { auth } = require('../middlewares/auth');
const { check, validationResult } = require('express-validator');
const Profile = require("../models/Profile");
const { findById, findOne } = require('../models/Profile');
const User = require('../models/User');
var mongoose = require('mongoose');






//get all profiles
router.get("/getProfiles", async(req, res) => {

    const filters = {...req.query };
    console.log(req.query);
    const paginationKeys = ["limit", "page", "sort"];
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;
    const skip = (page - 1) * limit;
    paginationKeys.map((el) => delete filters[el]);
    console.log(filters);
    console.time("query");
    const q = Profile.find(filters).populate("userId").populate("friendList").populate("friendRequestSent").populate("friendRequestPending");
    const profiles = await q.limit(limit).skip(skip);
    console.timeEnd("query");
    console.time("count");
    const countProfiles = await Profile.find(filters).countDocuments();
    console.timeEnd("count");
    if (req.query.page && skip > countProfiles) {
        return next(new AppError(400, "Page number out of range"));
    }
    return res.status(200).json({
        dataLength: countProfiles,
        message: "OK",
        data: profiles,
    });
})


//create profile
router.post("/createProfile", auth, async(req, res) => {
    let formData = {
        userId: req.user._id
    }
    try {
        let profile = await Profile.findOne({ userId: req.user._id })
        if (profile) {
            return res.status(400).send("This user had profile")
        }
        let emptyProfile = new Profile(formData)
        await emptyProfile.save()
        res.status(201).send({
            data: emptyProfile,
            "message": "Created Profile"
        })
    } catch (err) {
        console.log(err)
    }
})

//Update profile
router.post("/updatePersonal", auth, async(req, res) => {

    let { aboutMe, birthPlace, livesIn, phoneNumber, personalWebsite, status, occupation } = req.body
    let formData = {}
    formData.userId = req.user
    if (aboutMe) formData.aboutMe = aboutMe
    if (birthPlace) formData.birthPlace = birthPlace
    if (livesIn) formData.livesIn = livesIn
    if (phoneNumber) formData.phoneNumber = phoneNumber
    if (personalWebsite) formData.personalWebsite = personalWebsite
    if (status) formData.status = status
    if (occupation) formData.occupation = occupation

    try {

        let profile = await Profile.findOne({ userId: req.user._id })
        if (profile) {
            //Update
            profile = await Profile.findOneAndUpdate({ userId: req.user._id }, {
                    $set: formData
                }, {
                    new: true
                }).populate("userId", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])
                .populate("friendRequestSent", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])
                .populate("friendRequestPending", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])
                .populate("friendList", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])
            return res.status(201).send({
                data: profile,
                "message": "update Profile Succesfully"
            })
        }
    } catch (err) {
        // res.status(400).send({
        //     errors: err,
        //     "message": "Cannot create profile"
        // })
        console.log(err)

    }

})

//update account
router.post("/updateAccount", auth, async(req, res) => {
    let { avatar, banner, firstName, lastName, gender, dob } = req.body

    try {
        let account = await User.findById(req.user._id)
        if (account) {
            if (avatar) account.avatar = avatar
            if (banner) account.banner = banner
            if (firstName) account.firstName = firstName
            if (lastName) account.lastName = lastName
            if (gender) account.gender = gender
            if (dob) account.dob = dob

            await account.save()
            let profile = await Profile.findOne({ userId: req.user._id }).populate("userId", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])
                .populate("friendRequestSent", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])
                .populate("friendRequestPending", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])
                .populate("friendList", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])

            return res.send({
                data: profile,
                message: "Update Account Successfully"
            })
        }
        return res.status(500).send({
            message: "This user doesnt exist"
        })
    } catch (err) {
        res.status(400).send({
            errors: err,
            message: "Cannot update Account"
        })
    }

})

//update location
router.get("/getLocation", auth, async(req, res) => {
    console.log(req.query)
    try {
        let user = await User.findById(req.user._id)
        if (!user) {
            return res.send("This user doesnt exist")
        }
        user.location.longtitude = req.query.longtitude
        user.location.latitude = req.query.latitude
        await user.save()
        res.status(201).send({
            data: user,
            message: "got location"
        })

    } catch (err) {
        res.status(400).send({
            error: err
        })
    }



})

router.post("/updateHobbies", auth, async(req, res) => {
        let { hobbies, favoriteTVShow, favoriteMovies, favoriteGames, favoriteMusicBand, favoriteBooks, favoriteWriters, otherInterests } = req.body
        let formData = {}
        console.log(req.body, "backend")
        formData.userId = req.user
        if (hobbies) formData.hobbies = hobbies
        if (favoriteTVShow) formData.favoriteTVShow = favoriteTVShow
        if (favoriteMovies) formData.favoriteMovies = favoriteMovies
        if (favoriteGames) formData.favoriteGames = favoriteGames
        if (favoriteMusicBand) formData.favoriteMusicBand = favoriteMusicBand
        if (favoriteBooks) formData.favoriteBooks = favoriteBooks
        if (favoriteWriters) formData.favoriteWriters = favoriteWriters
        if (otherInterests) formData.otherInterests = otherInterests
        try {

            let profile = await Profile.findOne({ userId: req.user._id }).populate("userId", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])
                .populate("friendRequestSent", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])
                .populate("friendRequestPending", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])
                .populate("friendList", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])
            if (profile) {
                //Update
                profile.allHobbies = formData
                await profile.save()
                return res.status(201).send({
                    data: profile,
                    "message": "Update Profile Succesfully"
                })
            }


            let newProfile = new Profile({
                userId: req.user,
                allHobbies: formData
            })
            await newProfile.save()
            res.status(201).send({
                data: newProfile,
                "message": "Update Profile Succesfully"
            })


        } catch (err) {
            res.status(400).send({
                errors: err,
                "message": "Cannot update Profile"
            })

        }

    })
    //Create Education
router.post("/createEducation", [auth,
    check("school", "school is required").not().isEmpty(),
    check("degree", "degree is required").not().isEmpty(),
    check("fieldOfStudy", "field of study is required").not().isEmpty()
], async(req, res) => {
    const errors = validationResult(req.body)
    if (!errors.isEmpty) {
        return res.status(200).json({ errors: errors.array() })
    }
    const {
        school,
        degree,
        fieldOfStudy,
        fromDate,
        toDate,
        current,
        description
    } = req.body;
    const education = {
        school,
        degree,
        fieldOfStudy,
        fromDate,
        toDate,
        current,
        description
    }
    try {
        let profile = await Profile.findOne({ userId: req.user._id }).populate("userId", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])
            .populate("friendRequestSent", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])
            .populate("friendRequestPending", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])
            .populate("friendList", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])
        if (profile) {
            //Update
            profile.education.push(education)
            await profile.save()
            return res.status(201).send({
                data: profile,
                "message": "update Profile Succesfully"
            })
        }


        let newProfile = new Profile({
            userId: req.user,
            education: education
        })
        await newProfile.save()
        res.status(201).send({
            data: newProfile,
            "message": "Create Profile Succesfully"
        })
    } catch (err) {
        console.log(err)
        res.status(400).send({
            errors: err,
            "message": "Cannot update Profile"
        })
    }
})


router.delete("/deleteEducation/:id", auth, async(req, res) => {
    let id = req.params.id
    console.log(id)
    try {
        let profile = await Profile.findOne({ userId: req.user._id }).populate("userId", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])
            .populate("friendRequestSent", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])
            .populate("friendRequestPending", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])
            .populate("friendList", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])
        let deleteIndex = profile.education.findIndex(elm => elm._id == id)
        console.log(deleteIndex)
        profile.education.splice(deleteIndex, 1)
        await profile.save()
        res.status(201).send({
            data: profile,
            "message": "Delete Education Succesfully"
        })
    } catch (err) {
        console.log(err)
        res.status(400).send({
            errors: err,
            "message": "Cannot delete this Education"
        })
    }
})




//Create Experience
router.post("/createExperience", auth, async(req, res) => {

    console.log(req.body)

    const {
        company,
        jobTitle,
        location,
        fromDate,
        toDate,
        current,
        description
    } = req.body;
    const experience = {
        company,
        jobTitle,
        location,
        fromDate,
        toDate,
        current,
        description
    }
    try {
        let profile = await Profile.findOne({ userId: req.user._id }).populate("userId")
            .populate("friendRequestSent")
            .populate("friendRequestPending")
            .populate("friendList")
        if (profile) {
            //Update
            profile.experience.push(experience)
            await profile.save()
            return res.status(201).send({
                data: profile,
                "message": "update Profile Succesfully"
            })
        }


        let newProfile = new Profile({
            userId: req.user,
            experience: experience
        })
        await newProfile.save()
        res.status(201).send({
            data: newProfile,
            "message": "Create Profile Succesfully"
        })
    } catch (err) {
        console.log(err)
        res.status(400).send({
            errors: err,
            "message": "Cannot update Profile"
        })
    }
})


router.delete("/deleteExperience/:id", auth, async(req, res) => {
    let id = req.params.id
    console.log(id)
    try {
        let profile = await Profile.findOne({ userId: req.user._id }).populate("userId")
            .populate("friendRequestSent")
            .populate("friendRequestPending")
            .populate("friendList")
        let deleteIndex = profile.experience.findIndex(elm => elm._id == id)
        console.log(deleteIndex)
        profile.experience.splice(deleteIndex, 1)
        await profile.save()
        res.status(201).send({
            data: profile,
            "message": "Delete Experience Succesfully"
        })
    } catch (err) {
        console.log(err)
        res.status(400).send({
            errors: err,
            "message": "Cannot delete this Experience"
        })
    }
})




//get current profile
router.get("/me", auth, async(req, res) => {
    console.log(req.user)
    try {
        let profile = await Profile.findOne({ userId: req.user._id })
            .populate("userId")
            .populate("friendRequestSent")
            .populate("friendRequestPending")
            .populate("friendList")
        if (!profile) {
            return res.status(400).json({ mgs: "There is no profile for this user" })
        }
        res.send(profile)
    } catch (err) {
        console.log(err)
        res.status(500).json({ mgs: err.message })
    }

})

//get profile by id
router.get("/:profileId", async(req, res) => {
    let id = req.params.profileId
    try {
        let profile = await Profile.findOne({ userId: id }).populate("userId")
            .populate("friendRequestSent")
            .populate("friendRequestPending")
            .populate("friendList")
            // profile.userId = await profile.userId.populate("user", ["firstName", "lastName"])
        if (!profile) {
            return res.status(400).json({ mgs: "There is no profile for id" })
        }
        res.status(200).send(profile)
    } catch (err) {
        res.status(500).json({ mgs: err.message })
    }
})

//add to request
router.post("/friendRequest/:id", auth, async(req, res) => {


    let id = req.params.id
    try {
        if (id === req.user._id) {
            return res.status(400).send("You cannot send friend request to your self")
        }
        // let clientProfile = await Profile.findOne({ userId: id })
        //     .populate("userId", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])
        //     .populate("friendRequestSent", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])
        //     .populate("friendRequestPending", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])
        //     .populate("friendList", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])
        // let ownerProfile = await Profile.findOne({ userId: req.user._id })
        // .populate("userId", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])
        //     .populate("friendRequestSent", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])
        //     .populate("friendRequestPending", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])
        //     .populate("friendList", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])


        // if (clientProfile.friendRequestPending.includes(req.user._id) || ownerProfile.friendRequestSent.includes(clientProfile.userId)) {
        //     return res.status(400).send("You added this user")
        // }

        let clientProfile = await Profile.findOneAndUpdate({ userId: id }, { $addToSet: { friendRequestPending: req.user._id } }, { new: true })
            .populate("userId", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])
            .populate("friendRequestSent", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])
            .populate("friendRequestPending", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])
            .populate("friendList", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])
        let ownerProfile = Profile.findOneAndUpdate({ userId: req.user._id }, { $addToSet: { friendRequestSent: id } }).exec()






        // clientProfile.friendRequestPending.unshift(req.user._id)
        // await clientProfile.save()

        // ownerProfile.friendRequestSent.unshift(clientProfile.userId._id)
        // await ownerProfile.save()
        res.status(201).send({
            data: clientProfile,
            message: "Added to request list"

        })

    } catch (err) {
        console.log(err)
        res.status(400).send({
            errors: err,
            "message": "Cannot add "
        })
    }
})


//delete request
router.delete("/friendRequest/:id", auth, async(req, res) => {


    let id = req.params.id
    try {

        // let clientProfile = await Profile.findOne({ userId: id })
        //     // .populate("userId", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])
        //     //     .populate("friendRequestSent", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])
        //     //     .populate("friendRequestPending", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])
        //     //     .populate("friendList", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])
        // let ownerProfile = await Profile.findOne({ userId: req.user._id }).populate("userId", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])
        //     .populate("friendRequestSent", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])
        //     .populate("friendRequestPending", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])
        //     .populate("friendList", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])
        //     // if (!clientProfile || !ownerProfile) {
        //     //     return res.status(400).send("Cant find the profile")
        //     // }

        if (id == req.user._id) {
            return res.status(400).send("You cannot send friend request to your self")
        }





        // let clientIndex = clientProfile.friendRequestPending.findIndex(friend => friend._id.toString() == req.user._id.toString())
        // clientProfile.friendRequestPending.splice(clientIndex, 1)



        let clientProfile = Profile.findOneAndUpdate({ userId: id }, { $pull: { friendRequestPending: req.user._id } }, { new: true }).exec()

        // let ownerIndex = ownerProfile.friendRequestSent.findIndex(friend => friend._id.toString() == clientProfile.userId._id.toString())
        // ownerProfile.friendRequestSent.splice(ownerIndex, 1)
        let ownerProfile = await Profile.findOneAndUpdate({ userId: req.user._id }, { $pull: { friendRequestSent: id } }, { new: true })
            .populate("userId", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])
            .populate("friendRequestSent", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])
            .populate("friendRequestPending", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])
            .populate("friendList", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])


        res.status(201).send({
            data: ownerProfile,
            message: "Friend Request Deleted"

        })

    } catch (err) {
        console.log(err)
        res.status(400).send({
            errors: err,
            "message": "Cannot delete friend request"
        })
    }
})


//accpet friend request
router.post("/acceptFriendRequest/:id", auth, async(req, res) => {
    try {
        let id = req.params.id
        let clientProfile = await Profile.findOne({ userId: id }).populate("userId", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])
            .populate("friendRequestSent", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])
            .populate("friendRequestPending", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])
            .populate("friendList", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])

        let ownerProfile = await Profile.findOne({ userId: req.user._id }).populate("userId", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])
            .populate("friendRequestSent", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])
            .populate("friendRequestPending", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])
            .populate("friendList", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])

        if (!clientProfile || !ownerProfile) {
            return res.status(400).send("Cant find the profile")
        }

        if (clientProfile.userId._id == ownerProfile.userId._id) {
            return res.status(400).send("You cannot accpet you own friend request")
        }




        if (clientProfile.friendRequestSent.map(friend => friend._id).includes(req.user._id) && ownerProfile.friendRequestPending.map(friend => friend._id).includes(clientProfile.userId._id)) {
            console.log("zo day roi")

            console.log(mongoose.Types.ObjectId.isValid(req.user._id), "HUHUHUHU")
            console.log(mongoose.Types.ObjectId.isValid(clientProfile.userId._id), "HUHUHUHU")
            console.log(req.user._id, clientProfile.userId._id)




            let clientIndex = clientProfile.friendRequestSent.findIndex(friend => friend._id.toString() == req.user._id.toString())
            clientProfile.friendRequestSent.splice(clientIndex, 1)
            clientProfile.friendList.push(req.user._id)







            let ownerIndex = ownerProfile.friendRequestPending.findIndex(friend => friend._id.toString() == clientProfile.userId._id.toString())
            ownerProfile.friendRequestPending.splice(ownerIndex, 1)
            ownerProfile.friendList.push(clientProfile.userId._id)

            await ownerProfile.save()
            await clientProfile.save()

            return res.status(201).send({
                data: clientProfile,
                message: "Both of you are friend now ^^"

            })
        } else {
            res.status(400).send("You must add friend to accept friend request")
        }



    } catch (err) {
        console.log(err)
        res.status(400).send({
            errors: err,
            "message": "You must add friend to accpet friend request"

        })
    }




})



//unfriend
//accpet friend request
router.post("/unfriend/:id", auth, async(req, res) => {
    try {
        let id = req.params.id
        let clientProfile = await Profile.findOne({ userId: id }).populate("userId", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])
            .populate("friendRequestSent", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])
            .populate("friendRequestPending", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])
            .populate("friendList", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])

        let ownerProfile = await Profile.findOne({ userId: req.user._id }).populate("userId", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])
            .populate("friendRequestSent", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])
            .populate("friendRequestPending", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])
            .populate("friendList", ["firstName", "lastName", "email", "gender", "createdAt", "avatar", "banner", "dob"])

        if (!clientProfile || !ownerProfile) {
            return res.status(400).send("Cant find the profile")
        }

        if (clientProfile.userId._id == ownerProfile.userId._id) {
            return res.status(400).send("You cannot accpet you own friend request")
        }



        if (clientProfile.friendList.map(friend => friend._id).includes(req.user._id) && ownerProfile.friendList.map(friend => friend._id).includes(clientProfile.userId._id)) {
            console.log("zo unfriend nha")




            let clientIndex = clientProfile.friendList.findIndex(friend => friend._id.toString() == req.user._id.toString())
            clientProfile.friendList.splice(clientIndex, 1)








            let ownerIndex = ownerProfile.friendList.findIndex(friend => friend._id.toString() == clientProfile.userId._id.toString())
            ownerProfile.friendList.splice(ownerIndex, 1)


            await clientProfile.save()


            await ownerProfile.save()
            return res.status(201).send({
                data: clientProfile,
                message: "Unfriended"

            })
        } else {
            res.status(400).send("You must be friend with this person to unfriend")
        }



    } catch (err) {
        console.log(err)
        res.status(400).send({
            errors: err,


        })
    }




})




module.exports = router;