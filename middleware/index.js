var Place = require("../models/place");
var Comment = require("../models/comment");
var User = require("../models/user");

// all middleware goes here
var middlewareObj = {};



middlewareObj.checkPlaceOwnership = function(req, res, next) {
    // is user logged in? 
    if(req.isAuthenticated()){
        Place.findById(req.params.id, function(err, foundPlace){
            if(err || !foundPlace){
                req.flash("error", "Place not found");
                res.redirect("back");
            } else {
                //does user own the place - remember foundPlace.author.id is a mongoose object whereas req.user._id is a string so they are not equal
                if(foundPlace.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        var origin = req.originalUrl;
        console.log(origin);
        req.session.redirectTo = origin;
        req.flash("error", "You need to be logged in to do that");
        res.redirect("/login");
    }
};
middlewareObj.checkCommentOwnership = function(req, res, next) {
    // is user logged in? 
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err || !foundComment){
                req.flash("error", "Comment not found");
                res.redirect("back");
            } else {
                //does user own the comment - remember foundPlace.author.id is a mongoose object whereas req.user._id is a string so they are not equal
                if(foundComment.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

middlewareObj.checkUserOwnership = function(req, res, next) {
    // is user logged in? 
    if(req.isAuthenticated()){
                if(req.params.id == req.user._id) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    //flash code
    var origin = req.originalUrl;
    console.log(origin);
    req.session.redirectTo = origin;
    req.flash("error", "You need to be logged in to do that");
    res.redirect("/login");
};

// middlewareObj.restrict = function(req, res, next){
//     if (!req.session.userid) {
//         req.session.redirectTo = '/account';
//         res.redirect('/login');
//     } else {
//         next();
//     }
// };

module.exports = middlewareObj;