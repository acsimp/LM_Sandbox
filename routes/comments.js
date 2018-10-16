var express = require("express");
// with this we are swapping "app" for "router"
//mergeParams from places and comments so that inside comment route we can access :id
var router  = express.Router({mergeParams: true});
var Place = require("../models/place");
var User = require("../models/user");
var Comment = require("../models/comment");
var middleware = require("../middleware");
// var mongoose = require("mongoose");




//NEW COMMENT
//isLoggedIn function (created at the bottom) prevents user for creating a comment without loggin in
router.get("/new", middleware.isLoggedIn, function(req, res){
    //find place by ID 
    Place.findById(req.params.id, function(err, place){
        if(err){
            console.log(err);
        }else{
            res.render("comments/new", {place: place});
        }
    });
});

// CREATE COMMENT
//isLoggedIn prevents comments from Postman for example without a login
router.post("/", middleware.isLoggedIn, function(req, res){
    //look up place with id
   Place.findById(req.params.id).populate("comments").exec(function(err, place){
       if (err || !place || null) {
           console.log(err);
           req.flash("error", "ERROR: Something went wrong");
           res.redirect("/places");
       }else{
            User.findById(req.user.id, function(err, user) {
                if (err) {
            req.flash("error", "ERROR: Something went wrong.");
            res.redirect("back");
        } else {
        //   console.log(req.user);
        // User.findById(req.user, function(err, place){
        console.log("user ID: " + req.user.id);
               Comment.create(req.body.comment, function(err, comment){
                   if(err){
                       req.flash("error", "ERROR: Something went wrong!");
                       console.log(err);
                   }else{
                       //add username and id to comment
                       comment.author.id = req.user._id;
                       comment.author.username = req.user.username;
                       comment.place.id = place._id;
                       comment.place.name = place.name;
                       //console.log(req.body.rating_overall);
                       comment.rating.overall_star = req.body.rating_overall;
                       //save comment
                       comment.save();
                       if (typeof req.body.rating_overall!='undefined' && req.body.rating_overall) {
                           var overall_sum = parseInt( req.body.rating_overall, 10 );
                           var overall_count = 1;
                            for( var i = 0; i < place.comments.length; i++ ){
                                if (typeof place.comments[i].rating.overall_star!='undefined' && place.comments[i].rating.overall_star) {
                                overall_sum += parseInt( place.comments[i].rating.overall_star, 10 ); //don't forget to add the base
                                overall_count++;
                                }
                            }
                            var overall_mean = overall_sum/overall_count;
                            console.log("mean: " + overall_mean + ", count: " + overall_count);
                       
                       place.ratings.overall.mean = overall_mean;
                       place.ratings.overall.count = overall_count;
                       }
                       
                       place.comments.push(comment._id);
                    //   user.comments.push(comment._id);
                    // need error handling place.save(function(err){ etc.
                       place.save();
                       user.comments.push(comment._id);
                       user.markModified('comments');
                       user.save();
                    //   console.log("comment ID: " + user);
                        // console.log("1 " + comment._id)
                    //   user.comments.push(place._id);
                    //   user.save();
                    //   console.log("here?");
                       req.flash("success", "Successfully added comment");
                       res.redirect("/places/" + place._id);
                   }
                //   console.log("2 " + comment._id)
                   //user.comments.push(comment._id);
                       
               });
           }    
                       

            });
       }
   });
});

// EDIT COMMENT
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Place.findById(req.params.id, function(err, foundPlace){
        if(err || !foundPlace) {
            req.flash("error", "No place found");
            return res.redirect("back");
        }
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err){
                res.redirect("back");
            } else {
                //id is already available from app.js due to the prefix route files
                res.render("comments/edit", {place_id: req.params.id, comment: foundComment, back: req.params.id});       
            } 
        });
    });
});

// UPDATE comment
// remember route is prefixed in app.js 
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            res.redirect("back");
        } else {
            res.redirect("/places/" + req.params.id);
        }
    });
});


// COMMENT DESTROY ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err, foundComment){
        if(err){
            res.redirect("back");
        } else {
            // console.log(foundComment._id);
            User.findOneAndUpdate({ _id: req.user.id }, {$pull: { 'comments': foundComment._id}}).exec();
            Place.findOneAndUpdate({ _id: foundComment.place.id }, {$pull: { 'comments': foundComment._id}}).exec();
            req.flash("success", "Comment deleted");
            res.redirect("/places/" + req.params.id);
        }
    });
    });



// =========
module.exports = router;