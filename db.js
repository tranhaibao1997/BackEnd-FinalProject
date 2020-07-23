let mongoose = require("mongoose")

async function connectDB() {
    try {
        let url = "mongodb+srv://tranhaibao1997:bibi2345@socialnetwork-lahlw.mongodb.net/hai-bao-final-project?retryWrites=true&w=majority"
        let res = await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
        console.log("connected to the database")
    } catch (err) {
        console.log(err)
    }

}

module.exports = connectDB