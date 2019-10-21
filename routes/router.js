var express = require('express');
var router = express.Router();
var User = require('../models/user');

// GET route for reading data
// router.get('/', function (req, res, next) {
//     return res.sendFile(path.join(__dirname + '/templateLogReg/index.html'));
// });

router.post('/', function (req, res, next) {
    // confirm that user typed same password twice
console.log(res);
    if (req.body.password !== req.body.passwordConf) {
        var err = new Error('Passwords do not match.');
        err.status = 400;
        res.send("passwords dont match");
        return next(err);
    }

    if (req.body.email &&
        req.body.firstName &&
        req.body.lastName &&
        req.body.password &&
        req.body.passwordConf) {

        var userData = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: req.body.password,
            passwordConf: req.body.passwordConf
        }
        console.log(userData);
        User.create(userData, function (error, user) {
            if (error) {
                return next(error);
            } else {
                req.session.userId = user._id;
                return res.redirect('/login');
            }
        });
    } else if (req.body.logemail && req.body.logpassword) {
        User.authenticate(req.body.logemail, req.body.logpassword, function (error, user) {
            if (error || !user) {
                var err = new Error('Wrong email or password.');
                err.status = 401;
                return next(err);
            } else {
                req.session.userId = user._id;
                return res.redirect('/login');
            }
        });
    }
    else {
        var err = new Error('All fields required.' ,err);
        err.status = 400;
        return next(err);
    }
})
module.exports = router;
