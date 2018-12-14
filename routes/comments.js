var express = require("express");
// with this we are swapping "app" for "router"
//mergeParams from places and comments so that inside comment route we can access :id
var router = express.Router({ mergeParams: true });
var Place = require("../models/place");
var User = require("../models/user");
var Comment = require("../models/comment");
var middleware = require("../middleware");
var mongoose = require("mongoose");




//NEW COMMENT
//isLoggedIn function (created at the bottom) prevents user for creating a comment without loggin in
router.get("/new", middleware.isLoggedIn, function(req, res) {
    //find place by ID 
    Place.findById(req.params.id, function(err, place) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("comments/new", { place: place });
        }
    });
});

// CREATE COMMENT
//isLoggedIn prevents comments from Postman for example without a login
router.post("/", middleware.isLoggedIn, function(req, res) {
    //look up place with id
    Place.findById(req.params.id).populate("comments").exec(function(err, place) {
        if (err || !place || null) {
            console.log(err);
            req.flash("error", "ERROR: Something went wrong");
            res.redirect("/places");
        }
        else {
            User.findById(req.user.id, function(err, user) {
                if (err) {
                    req.flash("error", "ERROR: Something went wrong.");
                    res.redirect("back");
                }
                else {
                    //   console.log(req.user);
                    // User.findById(req.user, function(err, place){
                    console.log("user ID: " + req.user.id);
                    Comment.create(req.body.comment, function(err, comment) {
                        if (err) {
                            req.flash("error", "ERROR: Something went wrong!");
                            console.log(err);
                        }
                        else {
                            // console.log(req.body);
                            //add username and id to comment
                            comment.author.id = req.user._id;
                            comment.author.username = req.user.username;
                            comment.place.id = place._id;
                            comment.place.name = place.name;
                            comment.rating.overall_star = req.body.rating_overall;
                            comment.rating.cost_star = req.body.rating_cost;
                            comment.rating.baby_change_star = req.body.rating_baby_change;
                            comment.rating.food_star = req.body.rating_food;
                            comment.rating.play_star = req.body.rating_play;
                            comment.rating.staff_star = req.body.rating_staff;
                            comment.rating.breastfeeding_star = req.body.rating_breastfeeding;
                            comment.save(); // need error handling
                            // calculate the place average overall rating
                            if (typeof req.body.rating_overall != 'undefined' && req.body.rating_overall) {
                                var overall_5 = 0, overall_4 = 0, overall_3 = 0, overall_2 = 0, overall_1 = 0;
                                // add new rating to a running totals
                                var star_rating = parseInt(req.body.rating_overall, 10);
                                var overall_sum = star_rating;
                                var overall_count = 1;
                                if(star_rating == 5){
                                            overall_5++;
                                        } else if(star_rating == 4){
                                            overall_4++;
                                        } else if(star_rating == 3){
                                            overall_3++;
                                        } else if(star_rating == 2){
                                            overall_2++;
                                        } else if(star_rating == 1){
                                            overall_1++;
                                        }
                                
                                // add old ratings to the same running total
                                for (var i = 0; i < place.comments.length; i++) {
                                    if (typeof place.comments[i].rating.overall_star != 'undefined' && place.comments[i].rating.overall_star) {
                                        overall_sum += parseInt(place.comments[i].rating.overall_star, 10); //don't forget to add the base
                                        overall_count++;
                                        // sum 5, 4, 3, 2, 1 star weightings
                                        if(place.comments[i].rating.overall_star == 5){
                                            overall_5++;
                                        } else if(place.comments[i].rating.overall_star == 4){
                                            overall_4++;
                                        } else if(place.comments[i].rating.overall_star == 3){
                                            overall_3++;
                                        } else if(place.comments[i].rating.overall_star == 2){
                                            overall_2++;
                                        } else if(place.comments[i].rating.overall_star == 1){
                                            overall_1++;
                                        } 
                                    }
                                }
                                var overall_mean = overall_sum / overall_count;
                                console.log("overall_mean: " + overall_mean + ", overall_count: " + overall_count);
                                place.ratings.overall.mean = overall_mean;
                                place.ratings.overall.count = overall_count;
                                place.ratings.overall.five_count = overall_5;
                                place.ratings.overall.four_count = overall_4;
                                place.ratings.overall.three_count = overall_3;
                                place.ratings.overall.two_count = overall_2;
                                place.ratings.overall.one_count = overall_1;
                            }
                            // baby change
                            if (typeof req.body.rating_baby_change != 'undefined' && req.body.rating_baby_change) {
                                // add new rating to a running total
                                var baby_change_sum = parseInt(req.body.rating_baby_change, 10);
                                var baby_change_count = 1;
                                // add old ratings to the same running total
                                for (var i = 0; i < place.comments.length; i++) {
                                    if (typeof place.comments[i].rating.baby_change_star != 'undefined' && place.comments[i].rating.baby_change_star) {
                                        baby_change_sum += parseInt(place.comments[i].rating.baby_change_star, 10); //don't forget to add the base
                                        baby_change_count++;
                                    }
                                }
                                var baby_change_mean = baby_change_sum / baby_change_count;
                                console.log("baby_change_mean: " + baby_change_mean + ", baby_change_count: " + baby_change_count);
                                place.ratings.baby_change.mean = baby_change_mean;
                                place.ratings.baby_change.count = baby_change_count;
                            }
                            // cost
                            if (typeof req.body.rating_cost != 'undefined' && req.body.rating_cost) {
                                // add new rating to a running total
                                var cost_sum = parseInt(req.body.rating_cost, 10);
                                var cost_count = 1;
                                // add old ratings to the same running total
                                for (var i = 0; i < place.comments.length; i++) {
                                    if (typeof place.comments[i].rating.cost_star != 'undefined' && place.comments[i].rating.cost_star) {
                                        cost_sum += parseInt(place.comments[i].rating.cost_star, 10); //don't forget to add the base
                                        cost_count++;
                                    }
                                }
                                var cost_mean = cost_sum / cost_count;
                                console.log("cost_mean: " + cost_mean + ", cost_count: " + cost_count);
                                place.ratings.cost.mean = cost_mean;
                                place.ratings.cost.count = cost_count;
                            }
                            // food
                            if (typeof req.body.rating_food != 'undefined' && req.body.rating_food) {
                                // add new rating to a running total
                                var food_sum = parseInt(req.body.rating_food, 10);
                                var food_count = 1;
                                // add old ratings to the same running total
                                for (var i = 0; i < place.comments.length; i++) {
                                    if (typeof place.comments[i].rating.food_star != 'undefined' && place.comments[i].rating.food_star) {
                                        food_sum += parseInt(place.comments[i].rating.food_star, 10); //don't forget to add the base
                                        food_count++;
                                    }
                                }
                                var food_mean = food_sum / food_count;
                                console.log("food_mean: " + food_mean + ", food_count: " + food_count);
                                place.ratings.food.mean = food_mean;
                                place.ratings.food.count = food_count;
                            }
                            // play
                            if (typeof req.body.rating_play != 'undefined' && req.body.rating_play) {
                                // add new rating to a running total
                                var play_sum = parseInt(req.body.rating_play, 10);
                                var play_count = 1;
                                // add old ratings to the same running total
                                for (var i = 0; i < place.comments.length; i++) {
                                    if (typeof place.comments[i].rating.play_star != 'undefined' && place.comments[i].rating.play_star) {
                                        play_sum += parseInt(place.comments[i].rating.play_star, 10); //don't forget to add the base
                                        play_count++;
                                    }
                                }
                                var play_mean = play_sum / play_count;
                                console.log("play_mean: " + play_mean + ", play_count: " + play_count);
                                place.ratings.play.mean = play_mean;
                                place.ratings.play.count = play_count;
                            }
                            // breastfeeding
                            if (typeof req.body.rating_breastfeeding != 'undefined' && req.body.rating_breastfeeding) {
                                // add new rating to a running total
                                var breastfeeding_sum = parseInt(req.body.rating_breastfeeding, 10);
                                var breastfeeding_count = 1;
                                // add old ratings to the same running total
                                for (var i = 0; i < place.comments.length; i++) {
                                    if (typeof place.comments[i].rating.breastfeeding_star != 'undefined' && place.comments[i].rating.breastfeeding_star) {
                                        breastfeeding_sum += parseInt(place.comments[i].rating.breastfeeding_star, 10); //don't forget to add the base
                                        breastfeeding_count++;
                                    }
                                }
                                var breastfeeding_mean = breastfeeding_sum / breastfeeding_count;
                                console.log("breastfeeding_mean: " + breastfeeding_mean + ", breastfeeding_count: " + breastfeeding_count);
                                place.ratings.breastfeeding.mean = breastfeeding_mean;
                                place.ratings.breastfeeding.count = breastfeeding_count;
                            }
                            // staff
                            if (typeof req.body.rating_staff != 'undefined' && req.body.rating_staff) {
                                // add new rating to a running total
                                var staff_sum = parseInt(req.body.rating_staff, 10);
                                var staff_count = 1;
                                // add old ratings to the same running total
                                for (var i = 0; i < place.comments.length; i++) {
                                    if (typeof place.comments[i].rating.staff_star != 'undefined' && place.comments[i].rating.staff_star) {
                                        staff_sum += parseInt(place.comments[i].rating.staff_star, 10); //don't forget to add the base
                                        staff_count++;
                                    }
                                }
                                var staff_mean = staff_sum / staff_count;
                                console.log("staff_mean: " + staff_mean + ", staff_count: " + staff_count);
                                place.ratings.staff.mean = staff_mean;
                                place.ratings.staff.count = staff_count;
                            }
                            
                            
                            
                            place.comments.push(comment._id);
                            place.save(); // need error handling place.save(function(err){ etc.
                            user.comments.push(comment._id);
                            user.markModified('comments');
                            user.save(); // need error handling user.save(function(err){ etc.
                            
                            req.flash("success", "Successfully added comment");
                            res.redirect("/places/" + place._id);
                        }
                    });
                }
            });
        }
    });
});

// EDIT COMMENT
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res) {
    Place.findById(req.params.id, function(err, foundPlace) {
        if (err || !foundPlace) {
            req.flash("error", "No place found");
            return res.redirect("back");
        }
        Comment.findById(req.params.comment_id, function(err, foundComment) {
            if (err) {
                res.redirect("back");
            }
            else {
                //id is already available from app.js due to the prefix route files
                res.render("comments/edit", { place_id: req.params.id, comment: foundComment, back: req.params.id });
            }
        });
    });
});

// UPDATE comment
// remember route is prefixed in app.js 
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment) {
        if (err) {
            res.redirect("back");
        }
        else {
            req.flash("success", "Comment Updated");
            res.redirect("/places/" + req.params.id);
        }
    });
});


// COMMENT DESTROY ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, function(err, foundComment) {
        // Comment.findById(req.params.comment_id, function(err, foundComment) {
        if (err) {
            res.redirect("back");
        }
        else {
            // console.log(foundComment);
            // foundComment.remove(); //need a callback and error handling
            // remove comment ID from User document
            User.findOneAndUpdate({ _id: req.user.id }, { $pull: { 'comments': foundComment._id } }).exec(function(err, user) {
                if (err) {
                    console.log(err + "ERROR: something went wrong deleting comment from user document");
                }
                else {
                    // check that the comment was deleted from the User
                    console.log("USER Comments BEFORE: " + user.comments.length); // this is always giving the answer of 1 - this is wrong
                    User.findById(req.user.id).exec(function(err, userCheck) {
                        if (err) {
                            console.log(err + "ERROR: something went wrong loading user document");
                        }
                        else {
                            console.log("USER Comments AFTER: " + userCheck.comments.length); // this is always giving the answer of 1 - this is wrong
                        }
                    });
                }
            });
            // remove the comment ID from the Place document
            Place.findOneAndUpdate({ _id: foundComment.place.id }, { $pull: { 'comments': foundComment._id } }, { new: true }).populate("comments").exec(function(err, place) {
                if (err) {
                    console.log(err + "ERROR: something went wrong deleting comment ID from Place document");
                }
                else {
                    var overall_sum = 0;
                    var overall_count = 0;
                    for (var i = 0; i < place.comments.length; i++) {
                        if (typeof place.comments[i].rating.overall_star != 'undefined' && place.comments[i].rating.overall_star) {
                            overall_sum += parseInt(place.comments[i].rating.overall_star, 10); //don't forget to add the base
                            overall_count = overall_count + 1;
                        }
                        else {
                            overall_count = overall_count;
                        }
                    }
                    var overall_mean = overall_sum / overall_count;
                }
                // update Place document rating totals
                Place.findOneAndUpdate({ _id: foundComment.place.id }, { $set: { 'ratings.overall.mean': overall_mean, 'ratings.overall.count': overall_count } }).populate("comments").exec(function(err, place) {
                    if (err) {
                        console.log(err + "ERROR: ratings have not been updated");
                    }
                    else {

                    }
                });
            });
            req.flash("success", "Comment Deleted");
            res.redirect("/places/" + req.params.id);
        }
    });
});


// =========
module.exports = router;
