var express = require('express');
var router = express.Router();
const bcrypt = require('bcryptjs')
const { auth } = require('../middlewares/auth');
const { check, validationResult } = require('express-validator');
const Profile = require("../models/Profile");
const { findById } = require('../models/Profile');

//Update profile
router.post("/updatePersonal", [auth, [
    check('skill', "skill is required").isEmpty()
]], async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() })
    }
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
            })
            return res.status(201).send({
                data: profile,
                "message": "update Profile Succesfully"
            })
        }


        let newProfile = new Profile(formData)
        await newProfile.save()
        res.status(201).send({
            data: newProfile,
            "message": "Create Profile Succesfully"
        })


    } catch (err) {
        res.status(400).send({
            errors: err,
            "message": "Cannot create profile"
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

            let profile = await Profile.findOne({ userId: req.user._id })
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
        let profile = await Profile.findOne({ userId: req.user._id })
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
        let profile = await Profile.findOne({ userId: req.user._id })
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



//get current profile
router.get("/me", auth, async(req, res) => {
    try {
        let profile = await Profile.findOne({ userId: req.user._id })
        if (!profile) {
            return res.status(400).json({ mgs: "There is no profile for this user" })
        }
        res.send(profile)
    } catch (err) {
        res.status(500).json({ mgs: err.message })
    }

})

//get profile by id
router.get("/:profileId", async(req, res) => {
    let id = req.params.profileId
    try {
        let profile = await Profile.findOne({ userId: id }).populate("userId", ["firstName", "lastName", "email", "gender", "createdAt"])
            // profile.userId = await profile.userId.populate("user", ["firstName", "lastName"])
        if (!profile) {
            return res.status(400).json({ mgs: "There is no profile for id" })
        }
        res.status(200).send(profile)
    } catch (err) {
        res.status(500).json({ mgs: err.message })
    }
})





module.exports = router;