const express = require('express');
const router = express.Router();
const { auth } = require("../middlewares/auth");
const User = require("../models/User");
const Post = require("../models/Post");
const Profile = require("../models/Profile");





//get newfeeds
router.get("/newsfeed", auth, async(req, res) => {
        try {

            let ownerProfile = await Profile.findOne({ userId: req.user._id })
            let newfeedsTargets = ownerProfile.friendList.map(friend => friend._id)
            newfeedsTargets.unshift(req.user._id)
            let newFeedPost = await Post.find({ author: { $in: newfeedsTargets } }).populate("author").populate("onWall").sort({ date: -1 })
            res.status(201).send({
                data: newFeedPost,
                "message": "Got Newsfeed posts"
            })
        } catch (err) {
            res.status(400).send(err)
        }

    })
    //add new post
router.post("/", auth, async(req, res) => {
        try {
            const user = await User.findOne({ _id: req.user.id }).select("-password")
            let hashTag = [];
            req.body.text.split(" ").map((elm, index) => {
                if (elm.startsWith("#")) {
                    hashTag.push(elm)
                }
                return elm;
            }).join(" ");
            let newImgArray = req.body.images.map(img => ({
                imgLink: img,
                author: req.user.id,
                text: req.body.text,
                name: req.body.name,
                avatar: user.avatar,
                date: Date.now()
            }))

            console.log(newImgArray)

            const newPost = new Post({
                author: req.user.id,
                onWall: req.body.onWall,
                text: req.body.text,
                name: req.body.name,
                avatar: user.avatar,
                isShared: req.body.isShared,
                parents: req.body.parents,
                hashTag: hashTag,
                postImg: newImgArray,
                peopleTag: req.body.peopleTag,
                wallOwner: req.body.wallOwner,
                checkIn: req.body.checkIn

            })
            console.log(newPost)
            await newPost.save()

            // this is profile of user who is logging
            let ownerProfile = await Profile.findOne({ userId: req.user.id })

            //this is profile of profile wall
            // let customerProfile = await Profile.findOne({ userId: req.body.onWall })


            // if the user who is logging post image on his own wall => save img to his profile database
            // if the user who is logging post image on another wall => save img to the pp wall




            if (!ownerProfile) {
                return res.status(404).send({
                    error: "Profile not found"
                })
            }

            //user is posting on his own wall

            if (ownerProfile.userId == req.body.onWall) {

                ownerProfile.uploadedImages.unshift(newImgArray)
                ownerProfile.save()
                console.log("Da update authorProfile")
            }

            // if (customerProfile) {
            //     if (ownerProfile.userId == customerProfile.userId) {
            //         //do nothing
            //     } else {
            //         customerProfile.uploadedImages.unshift(newImgArray)
            //         await customerProfile.save()
            //         console.log("Da update customerProfile")
            //     }

            // }
            res.status(200).send({
                data: newPost,
                message: "Post new status successfully"
            })

        } catch (err) {
            console.log(err)
                // res.status(200).send({ err: err.message })
        }
    })
    //get all posts by Wall Id
router.get("/:id", auth, async(req, res) => {
        let id = req.params.id
        console.log(id)
        try {
            const posts = await Post.find({ onWall: id }).sort({ date: -1 }).populate("author").populate("onWall")
            res.status(201).send({
                data: posts,
                message: "Get All Post By Id"
            })
        } catch (err) {
            res.status(404).send(err)
        }


    })
    //get post by id
router.get("/:id", auth, async(req, res) => {
    try {
        const posts = await Post.findById(req.params.id)
        if (!posts) { return res.status(404).send("Not Found") }
        res.send(posts)
    } catch (err) {
        res.status(200).send(err)
    }
})

//delete post by id
router.delete("/:id", auth, async(req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id)
        if (!post) { return res.status(404).send("Post Not Found") }
        if (post.user.toString() !== req.user.id) {
            return res.status(401).send({ msg: "User not authorized" })
        }
        res.json({ msg: "post was removed" })
    } catch (err) {
        console.log(err)
        res.status(200).send(err)
    }
})

//like post
router.put("/like/:id", auth, async(req, res) => {
    try {
        let post = await Post.findById(req.params.id);
        console.log(post.likes, req.user.id)
        if (post.likes.filter(user => user._id == req.user.id).length > 0) {
            console.log("da like roi nha")
                //liked
            post.likes = post.likes.filter(user => user._id != req.user.id)
            console.log(post.likes)
            await post.save()
            return res.status(201).send({
                data: post,
                "message": "you liked this post"

            })

        }
        //havent like
        post.likes.unshift(req.user.id)
        await post.save()
        return res.status(201).send({
            data: post,
            "message": "you dislike this post"
        })



    } catch (err) {
        console.log(err);
        res.status(400).send(err)
    }
})


//add comment 
router.put("/comment/:id", auth, async(req, res) => {
    try {
        // let newImgArray = req.body.images.map(img => ({
        //     imgLink: img
        // }))
        const user = await User.findById(req.user.id).select("-password");
        const post = await Post.findById(req.params.id)
        const comment = {
            user: req.user.id,
            text: req.body.text,
            name: user.firstName + user.lastName,
            avatar: user.avatar,
            // imgLink: newImgArray
        }
        post.comments.push(comment)
        await post.save()
        res.status(201).send({
            data: post,
            "message": "Comment successful"
        })
    } catch (err) {
        console.log(err)
        res.status(400).send(err)
    }
})

//delete comment
router.delete("/comment/:id/:commentid", auth, async(req, res) => {

    try {
        const post = await Post.findById(req.params.id)
        console.log(post)
        const commentIndex = post.comments.map(item => item.id).indexOf(req.params.commentid);
        if (commentIndex === -1) { return res.json({ msg: "Comment doesnt exist" }) }
        if (req.user.id !== post.comments[commentIndex].user.toString()) { return res.status(200).send("This user cant delete this comment") }
        post.comments.splice(commentIndex, 1)
        await post.save()
        res.send({ data: post })

    } catch (err) {
        console.log(err)
        res.status(200).send(err)
    }
})



//update post
router.put("/:id", auth, async(req, res) => {
    let id = req.params.id
    console.log(req.body, "THIS IS FROM UPDATE")

    try {
        let hashTag = [];
        req.body.text.split(" ").map((elm, index) => {
            if (elm.startsWith("#")) {
                hashTag.push(elm)
            }
            return elm;
        }).join(" ");
        let newImgArray = req.body.images.map(img => ({
            imgLink: img,
            author: req.user.id,
            text: req.body.text,
            name: req.user.firstName + req.user.lastName,
            avatar: req.user.avatar,
            date: Date.now()
        }))

        req.body.hashTag = hashTag
        req.body.postImg = newImgArray
        const post = await Post.findByIdAndUpdate(id, {
            $set: req.body
        }, {
            new: true
        })
        res.status(201).send({
            data: post,
            message: "update post successfully"
        })
    } catch (err) {
        console.log(err)
    }
})




module.exports = router