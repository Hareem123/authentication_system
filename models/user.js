var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    firstName: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
    }
});

UserSchema.statics.authenticate = function (email, password, callback) {
    User.findOne({ email: email }).exec(function (err, user) {
        if (err) {
            return callback(err)
        } else if (!user) {
            var err = new Error('User not found.');
            err.status = 401;
            callback(err);
            return callback
        }
        bcrypt.compare(password, user.password, function (err, result) {
            if (result === true) {
                callback(null, user);
                return callback
            } else {
                return callback();
            }
        })
    });
}

//hashing a password before saving it to the database
UserSchema.pre('save', function (next) {
    var user = this;
    bcrypt.hash(user.password, 10, function (err, hash) {
        if (err) {
            return next(err);
        }
        user.password = hash;
        next();
    })
});


var User = mongoose.model('User', UserSchema);
module.exports = User;
