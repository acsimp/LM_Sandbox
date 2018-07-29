var express = require("express");
// with this we are swapping "app" for "router"
var router  = express.Router();
var Place = require("../models/place");
var middleware = require("../middleware");
var request = require('request-promise');  



// //INDEX - show all places w/ FB photo
// router.get("/", function(req, res){
//     //get all places from the db
//     var fb_place = {};
//     var fb_place2 = {};
//   Place.find({}, function(err, allPlaces){
//         if(err){
//             console.log(err);
//       } else {
//             //res.render("places/index");
//             var i;
//             //for (i = 0; i < allPlaces.length; i++) { 
//             //allPlaces.forEach(function(allPlaces){
//             //call facebook API
//             const userFieldSet = 'id, photos{images}, picture{url}, cover';
//             const options = {
//             method: 'GET',
//             uri: `https://graph.facebook.com/v3.0/${JSON.parse(allPlaces[0].fb_id)}`,
//             qs: {
//               access_token: process.env.access_token,
//               fields: userFieldSet
//             }
//           };
//           request(options)
//             .then(fbRes => {
//               //fb_place.push(JSON.parse(fbRes));
//               fb_place2 = JSON.parse(fbRes);
//               //fb_place.push(fb_place2);
//               //fb_place.push(fbRes);
//             //console.log(JSON.parse(fbRes));
//             fb_place.push(JSON.parse(fbRes));
             
//             });
//         //fb_place.push(i);
//         fb_place.push("1");
//         //fb_place.push(JSON.parse(fb_place2));

        
//             //}
//       }
       
//             console.log(fb_place);
//             console.log(allPlaces);
//             //res.send(allPlaces);
//             console.log('https://graph.facebook.com/v3.0/' + JSON.parse(allPlaces[0].fb_id));

            
//           res.render("places/index",{places:allPlaces, currentUser: req.user, fb_place: fb_place});
            
//   });
//   });


//INDEX - show all places
router.get("/", function(req, res){
    var perPage = 6;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
    //fuzzy search
    var noMatch = null;
    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), "gi");
        Place.find({ $or: [ {name: regex}, {description: regex}, { price: regex }, {"author.username": regex } ]}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function(err, allPlaces){
            Place.count({name: regex}).exec(function (err, count) {
        
        if(err){
            console.log(err);
            res.redirect("back");

        } else {
            if(allPlaces.length < 1){
                noMatch = "No places match that query, please try again.";
            } 
          res.render("places/index",{
              places:allPlaces, 
              currentUser: req.user, 
              noMatch: noMatch,
              current: pageNumber,
              pages: Math.ceil(count / perPage),
              search: req.query.search
          });
        }
    });
});

    } else{
    //get all places from the db
    Place.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function(err, allPlaces){
        Place.count().exec(function (err, count) {
        if(err){
            console.log(err);
        } else {
          res.render("places/index",{
              places:allPlaces,
              currentUser: req.user,
              noMatch: noMatch,
              current: pageNumber,
              pages: Math.ceil(count / perPage),
              search: false
                    });
                }
            });
        });
    }
});

// MAP - show  map of places
router.get("/map", function(req, res){
    //get all places from the db
  Place.find({}, function(err, allPlaces){
        if(err){
            // console.log(err);
            res.status(500);
            res.send('500');
      } else {
            //res.render("places/index");
            
          res.render("places/map",{places:allPlaces, currentUser: req.user, page: 'map'});

        }
    });
});


// //INDEX - show all places
// router.get("/", function(req, res){
//     //get all places from the db
//   Place.find({}, function(err, allPlaces){
//         if(err){
//             console.log(err);
//       } else {
//             //res.render("places/index");
            
//           res.render("places/index",{places:allPlaces, currentUser: req.user});

//         }
//     });
// });





//CREATE - add new place to DB
router.post("/", middleware.isLoggedIn, function(req, res){
    //get data from form and add to array
    var name  = req.body.name;
    var image = req.body.image;
    var fb_id  = req.body.fb_id;
    var author = {
        id: req.user._id,
        username:req.user.username
    };

    //create new object
    var newPlace = {name: name, image: image, fb_id: fb_id, author: author};
    //create a new place and save to database
    Place.create(newPlace, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to place
            //  res.redirect("/place");
            //render show template with that place
            res.render("places/show", {place: newlyCreated});
        }
    });
});

//NEW - show form to create new place
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("places/new");
});


// SHOW MAVEN + FB - shows more info about one place
router.get("/:id", function(req, res) {
    //find the place with provided ID and populate with comment content not just id
    Place.findById(req.params.id).populate("comments").exec(function(err, foundPlace) {
        if (err || !foundPlace) {
            req.flash("error", "Place not found");
            res.redirect("/places");
        }
        else {
            //call facebook API ----------------------------------
            const userFieldSet = 'id, about, name, location, checkins, link, rating_count, overall_star_rating, description, website, phone, photos{images}, hours, engagement, restaurant_specialties, restaurant_services, price_range, single_line_address, is_verified, picture{url}, category_list, cover, is_permanently_closed';
            const options = {
                method: 'GET',
                uri: `https://graph.facebook.com/v3.0/${foundPlace.fb_id}`,
                qs: {
                    access_token: process.env.access_token,
                    fields: userFieldSet
                }
            };
            request(options)
                .then(fbRes => {
                    var fb_place = JSON.parse(fbRes);
                    //if place.website does not contain http:// or https:// it simple adds to the end of current url
                    //this code checks for http and adds if missing
                    if (fb_place.website) {
                        var tarea = fb_place.website;
                        //console.log(tarea);
                        if (tarea.indexOf("http://") == 0 || tarea.indexOf("https://") == 0) {}
                        else {
                            fb_place.website = "http://" + fb_place.website;
                            //console.log(place.website);
                        }
                    }
                    //console.log(place);
                    //res.json(place);
                    //render show template with that place
                    res.render("places/show", { place: foundPlace, fb_place: fb_place });
                    console.log(foundPlace.name);
                });
        }
    });
});

// EDIT place route
router.get("/:id/edit", middleware.checkPlaceOwnership, function(req, res) {
    Place.findById(req.params.id, function(err, foundPlace) {
        if (err || !foundPlace) {
            req.flash("error", "No place found");
            return res.redirect("back");
        }
        else {
            res.render("places/edit", { place: foundPlace });
        }
    });
});

// UPDATE place route
router.put("/:id", middleware.checkPlaceOwnership, function(req, res) {
    // geocoder.geocode(req.body.location, function (err, data) {
    // if (err || !data.length) {
    //   req.flash('error', 'Invalid address');
    //   return res.redirect('back');
    // }
    // var lat = data[0].latitude;
    // var lng = data[0].longitude;
    // var location = data[0].formattedAddress;
    var newData = { name: req.body.name, image: req.body.image, description: req.body.description, location: location, lat: lat, lng: lng, price: req.body.price };
    //find and update place
    Place.findByIdAndUpdate(req.params.id, newData, function(err, place) {
        if (err) {
            req.flash("error", err.message);
            res.redirect("back");
        }
        else {
            //redirect to show page
            req.flash("success", "Successfully Updated!");
            res.redirect("/places/" + req.params.id);
        }
    });
});

// DESTROY Place Route
router.delete("/:id", middleware.checkPlaceOwnership, function(req, res){
    Place.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/places");
        } else {
            res.redirect("/places");
        }
    });
});

// part of fuzzy search
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

//exporting "router"
module.exports = router;



