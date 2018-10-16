var express = require("express");
// with this we are swapping "app" for "router"
var router = express.Router();
var request = require('request-promise');
var passport = require("passport");
var User = require("../models/user");
var middleware = require("../middleware");
var Place = require("../models/place");
var Comment = require("../models/comment");
var jwt = require('jsonwebtoken');

const fs = require('fs');



// ROOT ROUTE
router.get("/", function(req, res) {
    res.render("landing", { page: 'landing' });
});



// TOKEN ROUTE
router.get("/token", (req, res, next) => {
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    next();
}, (req, res) => {
            // for apple mapkit js
    let payload = {
        iss: "FUXQZ62Z9M", // Issuer: Your Apple Developer Team ID */
        iat: Date.now() / 1000, // Issued at: Current time in seconds */
        exp: (Date.now() / 1000) + 1500, // Expiration: Time to expire in seconds */ 
        // origin: "https://yourdomain.com" /* (recommended - a domain restriction) */
    };
    
    let authKey = fs.readFileSync("AuthKey_249NJBN2JJ.p8");
    //let keyFile = fs.readFileSync("AuthKey_249NJBN2JJ.p8");
    
    
    let header = {
        kid: "249NJBN2JJ", // Key Id: Your MapKit JS Key ID */ 
        typ: "JWT", // Type of token 
        alg: "ES256" // The hashing algorithm being used */
    };
    
    // let authorizatonToken = jwt.sign(payload, authKey, { header: header });
    console.log(payload);
    
    res.send(
        jwt.sign(payload, authKey, { header: header }));
        console.log(jwt.sign(payload, authKey, { header: header }));
});




//--FACEBOOK API SEARCH TEST LIST-------------------------------------------------------------------------------------------------------- 
router.get('/list', (req, res)  => {
    // you need permission for most of these fields
    const userFieldSet = 'id, name, location, checkins, link, rating_count, overall_star_rating, photos{images}, price_range, single_line_address, picture, category_list, cover, engagement, website';
    var coords = '55.8480, -4.4128';
    var radiusKm = '1000';
    var limit = 25;
    const options = {
        method: 'GET',
        uri: `https://graph.facebook.com/v3.0/search?type=place`,
        qs: {
            access_token: process.env.access_token,
            fields: userFieldSet,
            categories: ["FOOD_BEVERAGE"],
            center: coords,
            distance: radiusKm,
            limit: limit,
        }
    };
    request(options)
        .then(fbRes => {
            var place = JSON.parse(fbRes);
            //console.log(place);
            //res.json(place);
            res.render('list', { place: place });
        });
});
//---------------------------------------------------------------------------------------------------------- 


//==============
// AUTH ROUTES
//==============

//show register form
router.get("/register", function(req, res) {
    res.render("register", { page: 'register' });
});


//handle sign up logic
router.post("/register", function(req, res) {
    var newUser = new User({
        username: req.body.username,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        avatar: req.body.avatar
    });

    if (req.body.adminCode === 'secretcode123') {
        newUser.isAdmin = true;
    }

    User.register(newUser, req.body.password, function(err, user) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("/register");
        }
        passport.authenticate("local")(req, res, function() {
            req.flash("success", "Welcome to Little Maven " + user.username + "! Nice to meet you :)");
            res.redirect("/places");
        });
    });
});


// EDIT User route
router.get("/users/:id/edit", middleware.checkUserOwnership, function(req, res) {
    //middleware.isLoggedIn
    User.findById(req.params.id, function(err, foundUser) {
        if (err || !foundUser) {
            req.flash("error", "No user found");
            return res.redirect("back");
        }
        else {
            res.render("users/edit", { user: foundUser, page: 'register' });
        }
    });
});

// UPDATE User route
router.put("/users/:id", middleware.isLoggedIn, function(req, res) {
    var newData = { firstname: req.body.firstname, lastname: req.body.lastname, email: req.body.email, avatar: req.body.avatar };
    if (req.body.adminCode === 'secretcode123') {
        newData.isAdmin = true;
    }
    //find and update Place
    User.findByIdAndUpdate(req.params.id, newData, function(err, user) {
        if (err) {
            req.flash("error", err.message);
            res.redirect("back");
        }
        else {
            //redirect to show page
            req.flash("success", "Successfully Updated!");
            res.redirect("/users/" + req.params.id);
        }
    });
});




//LOGIN FORM
router.get("/login", function(req, res) {
    res.render("login", { page: 'login' });
});

passport.authenticate('local', { successFlash: 'Welcome!' });

//LOGIN logic (with middleware)
router.post("/login", passport.authenticate("local", {
    successRedirect: "/places",
    failureRedirect: "/login",
    failureFlash : true,
    successFlash : true,
}), function(req, res) {
    //this callback doesn't do anything, could be removed. Here to illustrate middleware.
});

//LOGOUT ROUTE
router.get("/logout", function(req, res) {
    //comes from passport package
    req.logout();
    req.flash("success", "Logged you out!");
    res.redirect("/Places");
});


// USER PROFILE
router.get("/users/:id", function(req, res) {
    // var  place={};
    // var  comment={};
    User.findById(req.params.id, function(err, foundUser) {
        if (err) {
            req.flash("error", "Something went wrong.");
            res.redirect("back");
        }
        console.log(foundUser);
        Place.find().where("author.id").equals(foundUser._id).exec(function(err, places) {
            if (err) {
                req.flash("error", "Something went wrong.");
                res.redirect("back");
            }
            // console.log(places);
            // place == places;
        Comment.find().where("author.id").equals(foundUser._id).exec(function(err, comments) {
            if (err) {
                req.flash("error", "Something went wrong.");
                res.redirect("back");
                // next();
            }
            console.log(comments);
            // comment == comments;
        
        // console.log(place);
        // console.log(comment);
        res.render("users/show", { user: foundUser, places: places, comments: comments, page: 'user' });
            //  console.log(foundUser._id);
            //  console.log(req.params.id);
    });
        });
    });
});

// router.get("/users/:id", function(req, res){
//     User.findById(req.params.id, function(err, foundUser){
//         if(err) {
//             req.flash("error", "Something went wrong.");
//             res.redirect("back");
//         }
//         console.log(foundUser);
//         console.log(foundUser._id);
//         Place.find().where("author.id").equals(foundUser._id).exec(function(err, places) {
//                     if(err) {
//             req.flash("error", "Something went wrong.");
//             res.redirect("back");
//         }
//          res.render("users/show", {user:foundUser, places: places});
//                 //  console.log(req.user._id);
//                  console.log(req.params.id);
//                  console.log("test");

//         });
//     });
// });


module.exports = router;