var express = require('express')
    , passport = require('passport')
    , util = require('util')
    , LocalStrategy = require('passport-local').Strategy;
var app = express();
var config = require("./config.js");
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');
module.exports = app;
var mongoose = require('mongoose');
mongoose.connect("mongodb://localhost:27017/user",{ useNewUrlParser: true,useUnifiedTopology: true  })
    .then(() => console.log('Now connected to MongoDB!'))
    .catch(err => console.error('Something went wrong', err));
var db = mongoose.connection;
var port = process.env.PORT || 3300;
var crypto = require("crypto");
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');

app.use(bodyParser.json({limit:"50mb"})); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cookieParser());
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    cookie : { secure : false, maxAge : (40 * 60 * 60 * 1000)}// 4 hours
}));

app.post('/signup',function(req,res){
    var pass = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8), null);
    var collection =db.collection("users");
    var data={
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        _email: req.body.email,
        password:pass
    };
    if(req.body.password !== req.body.confPassword) {
        res.send({success:false,message:"failed"});
    }

    collection.findOne({_email:req.body.email},function (err,doc) {
        if(doc){
            res.send({sucess:true,message:"This email already exist"})
        }
        else{
            collection.insertOne(data,function (error) {
                if(error){
                    res.send({error:true,message:error.errmsg})
                }
                else{
                    res.send({success:true,message:"You have been signup"})
                }
            });
        }
    });
});

app.post("/login",function (req,res) {
    // var hashedPassword = bcrypt.hashSync(req.body.password,bcrypt.genSaltSync(8), null);
    collection = db.collection("users");
    var user = {
        email : req.body.email,
        password : req.body.password
    }
    if (!req.body.email || !req.body.password) {
        console.log(req.body);
        console.log(req.body.email);
        res.json({success: false, message: 'Please enter email and password.'});
    }
    else {
    // console.log(`email to find: ${req.body.email}`)
        collection.findOne({_email:req.body.email},function (error,doc) {
            // console.log(`db result, error:${JSON.stringify(error)} doc:${JSON.stringify(doc)}`)
            if(doc){
                // console.log(`doc:${JSON.stringify(doc.password)}`)
                if(bcrypt.compareSync(user.password, doc.password)) {
                    var token = jwt.sign({ id: user._id }, config.secret, {
                        expiresIn: 86400 // expires in 24 hours
                    });
                    res.send({success:true, message:"You have been LoggedIn Successfully"})
                } else {
                    res.send({error:true, message:"Please check your credentials"})
                }

            }
            else{
                res.send({error:true, message:error.errmsg})
            }
        })
    }
});

app.listen(3300, function () {
    console.log('Express app listening on port 3000');
});
