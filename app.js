var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var connectDB = require('./db');
let bcrypt = require('bcryptjs')
const passport = require('passport')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth')
var profileRouter = require('./routes/profile')
var postRouter = require("./routes/post")
const cors = require('cors')


var app = express();

// FACEBOOK_CLIENT_ID = "706084776845167"
// FACEBOOK_CLIENT_SECRET = "f8a83927dd60098219735a77e009bae2"
// FACEBOOK_CALLBACK_URL = "https://localhost:5000/api/auth/facebook/authorized"

//connect to database
connectDB()

// view engine setup
app.use(passport.initialize())

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors())

app.use('/api/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/post', postRouter)


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error middleware
app.use((err, req, res, next) => {
    // default err object of undefined
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message
    });
});

// 404 handler
function notFound(req, res, next) {
    const err = new Error("Route not found");
    err.status = "fail";
    err.statusCode = 404;
    next(err);
};

app.route("*").all(notFound);

let errorController = (err, req, res, next) => {
    // default err object of undefined
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message
    });
}
app.use(errorController)

const multer = require('multer')
const upload = multer({
    dest: 'images',
    limits: {
        fileSize: 1000000
    }
})
app.post("/upload", upload.single(), (req, res) => {
    res.send("OK")
})

module.exports = app;