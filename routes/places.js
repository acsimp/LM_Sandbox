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
    var perPage = 8;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
    //fuzzy search
    var noMatch = null;
    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), "gi");
        Place.find({ $or: [ {name: regex}, {description: regex}, { price: regex }, {"author.username": regex } ]}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function(err, allPlaces){
            Place.countDocuments({name: regex}).exec(function (err, count) {
        
        if(err){
            console.log(err);
            res.redirect("back");

        } else {
            if(allPlaces.length < 1){
                noMatch = "No places match that query, please try again.";
            } 
          res.render("places/index",{
              places: allPlaces, 
              currentUser: req.user, 
              noMatch: noMatch,
              current: pageNumber,
              pages: Math.ceil(count / perPage),
              search: req.query.search,
              count: count,
              limit: perPage,
          });
        }
    });
});

    } else{
    //get all places from the db
    Place.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function(err, allPlaces){
        Place.countDocuments().exec(function (err, count) {
        if(err){
            console.log(err);
        } else {
          res.render("places/index",{
              places:allPlaces,
              currentUser: req.user,
              noMatch: noMatch,
              current: pageNumber,
              pages: Math.ceil(count / perPage),
              search: false,
              count: count,
              limit: perPage,
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
    var single_line_address = req.body.formattedAddress;
    var latitude = req.body.latitude;
    var longitude = req.body.longitude;
    var apple_card = req.body._wpURL;
    var apple_id = req.body.muid;
    var google_id = req.body.googlePlaceID;
    var fb_id  = req.body.fbPlaceID;
    var images =
        {card_img: req.body.imageURL};
    var author = {
        id: req.user._id,
        username:req.user.username
    };

    //create new object
    var newPlace = {
            name: name, 
            single_line_address: single_line_address, 
            latitude: latitude,
            longitude: longitude,
            apple_card: apple_card,
            apple_id: apple_id,
            google_id: google_id,
            fb_id: fb_id, 
            images: images,
            author: author
    };
    
    
    
    //create a new place and save to database
    Place.create(newPlace, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to place
            //  res.redirect("/place");
            //render show template with that place
            //console.log(newlyCreated);
            //res.render("places/show", {place: newlyCreated, fb_place: fb_place });
            res.redirect("places/" + newlyCreated._id);
        }
    });
});

//NEW - show form to create new place
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("places/new", {page: 'form'});
});


// SHOW MAVEN + FB - shows more info about one place
router.get("/:id", function(req, res) {
    //find the place with provided ID and populate with comment content not just id
    Place.findById(req.params.id).populate("comments").exec(function(err, foundPlace) {
        if (err || !foundPlace || null) {
            req.flash("error", "ERROR: Place not found");
            res.redirect("/places");
            // should maybe redirect to a no place found "sorry :P" page
            //console.log(foundPlace.name + " - nae fb_id!");
        }
        if (typeof foundPlace!='undefined' && !foundPlace.fb_id) {
            // req.flash("error", "This place has no Facebook ID");
            // res.redirect("/places");
            var fb_place = {};
            res.render("places/show", { place: foundPlace, fb_place: fb_place});
            console.log(foundPlace.name + " - nae fb_id!");
        }
        else if (typeof foundPlace!='undefined' && typeof foundPlace.fb_id!='undefined'){
            
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
                    //res.json(foundPlace);
                    //render show template with that place
                    res.render("places/show", { place: foundPlace, fb_place: fb_place });
                    console.log(foundPlace.name);
                })
                .catch(function (err) {
        // API call failed...
        var fb_place = {};
        res.render("places/show", { place: foundPlace, fb_place: fb_place});
        res.status(err).send("failed to return response - ");
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
            res.render("places/edit", { place: foundPlace, page: 'form' });
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
    
    var name  = req.body.name;
    var single_line_address = req.body.single_line_address;
    var latitude = req.body.latitude;
    var longitude = req.body.longitude;
    var apple_card = req.body._wpURL;
    var apple_id = req.body.muid;
    var google_id = req.body.googlePlaceID;
    var fb_id  = req.body.fbPlaceID;
    var images =
        {card_img: req.body.imageURL};
    var category = req.body.category.split(', ');
    var street = req.body.street;
    var city = req.body.city;
    var postcode = req.body.postcode;
    var country = req.body.country;
    var description = req.body.description;
    var website = req.body.website;
    var phone = req.body.phone;
    var email = req.body.email;
    var baby_change = {
            ladies : req.body.baby_change_ladies,
            gents : req.body.baby_change_gents,
            disabled : req.body.baby_change_disabled,
            room : req.body.baby_change_room,
            free_nappy : req.body.baby_change_free_nappy,
        };
    var parking = {
            onsite : req.body.parking_onsite,
            nearby: req.body.parking_nearby,
            free : req.body.parking_free,
            parent_and_child : req.body.parent_and_child,
        };
    var close_transport = req.body.close_transport;
    var buggy = {
            access : req.body.buggy_access,
            space_for : req.body.buggy_space_for,
            store : req.body.buggy_store,
        };
    var menu_link = req.body.menu_link;
    var kids_menu_link = req.body.kids_menu_link;
    var slug = req.body.slug;
    var reservations = req.body.reservations;
    var licenced = req.body.licenced;
    var work_friendly = req.body.work_friendly;
    var onsite_cafe_restaurant = req.body.onsite_cafe_restaurant;
    var table_service = req.body.table_service;
    var delivery = req.body.delivery;
    var pickup = req.body.pickup;
    var takeout = req.body.takeout;
    var walk_ins = req.body.walk_ins;
    var walk_ins_only = req.body.walk_ins_only;
    var customer_toilets = req.body.customer_toilets;
    var gift_vouchers = req.body.gift_vouchers;
    var venue_hire = req.body.venue_hire;
    var cuisine = req.body.cuisine.split(', ');
    var special_notes = req.body.special_notes;
    var meal_type = {
            breakfast : req.body.breakfast,
            lunch : req.body.lunch,
            dinner : req.body.dinner,
            coffee : req.body.coffee,
            drinks : req.body.drinks,
            treats : req.body.treats,
    };
    var vegetarian_options = req.body.vegetarian_options;
    var vegan_options = req.body.vegan_options;
    var healthy_options = req.body.healthy_options;
    var organic_options = req.body.organic_options;
    var halal_options = req.body.halal_options;
    var great_coffee = req.body.great_coffee;
    var great_cake = req.body.great_cake;
    var snacks_available = req.body.snacks_available;
    var allergy = {
            friendly : req.body.allergy_friendly,
            gluten : req.body.gluten,
            nut : req.body.nut,
            dairy : req.body.dairy,
            eggs : req.body.eggs,
    };
    var lots_of_space = req.body.lots_of_space;
    var group_friendly = req.body.group_friendly;
    var large_group_space = req.body.large_group_space;
    var breastfeeding = {
            friendly : req.body.breastfeeding_friendly,
            discreet : req.body.breastfeeding_discreet,
            no_purchase_req : req.body.breastfeeding_no_purchase_req,
            feeding_room : req.body.breastfeeding_feeding_room,
    };
    var highchairs = {
            available : req.body.highchairs_available,
            lots : req.body.highchairs_lots,
    };
    var kids_menu = req.body.kids_menu;
    var kids_utensils = req.body.kids_utensils;
    var BYO_infant_food = {
            allowed : req.body.BYO_allowed,
            microwave : req.body.BYO_microwave,
            bottle_warmer : req.body.BYO_bottle_warmer,
    };
    var play = {
            indoor : req.body.play_indoor,
            outdoor : req.body.play_outdoor,
            toys : req.body.play_toys,
            colouring: req.body.play_colouring,
            soft : req.body.play_soft,
            creche : req.body.play_creche,
    };
    var seating = {
            indoor : req.body.seating_indoor,
            outdoor : req.body.seating_outdoor,
            picnic : req.body.picnic,
            party_size : req.body.party_size,
            fifty_plus_seats : req.body.fifty_plus_seats,
    };
    var dog = {
            friendly : req.body.dog_friendly,
            water : req.body.dog_water,
            inside : req.body.dog_inside,
            outside : req.body.dog_outside,
            restricted : req.body.dog_restricted,
            good_walks : req.body.dog_walks,
            restrictions : req.body.dog_restrictions,
    };
    var wifi = req.body.wifi;
    var other_facilities = req.body.other_facilities;
    var disability = {
            friendly : req.body.disability_friendly,
            access : req.body.disability_access,
            spacious : req.body.disability_spacious,
            parking : req.body.disability_parking,
            toilet : req.body.disability_toilet,
            induction_loop : req.body.disability_induction_loop,
            ir_induction_loop : req.body.disability_ir_induction_loop,
            braille : req.body.disability_braille,
    };
    var good_for = {
            play : req.body.good_for_play,
            party : req.body.good_for_party,
            large_groups : req.body.good_for_large_groups,
            supervised_visits : req.body.good_for_supervised_visits,
            age_goup : {
                newborn : req.body.age_group_newborn,
                baby : req.body.age_group_baby,
                toddler : req.body.age_group_toddler,
                pre_school : req.body.age_group_pre_school,
                school : req.body.age_group_school,
            }, 
        };
    var permanently_closed = req.body.permanently_closed;
    var temporarily_closed = req.body.temporarily_closed;
    var kid_friendly = req.body.kid_friendly;
    var not_for_kids = req.body.not_for_kids;
    var verified_by_owner = req.body.verified_by_owner;
    var kid_restrictions = req.body.kid_restrictions;
    
    var newData = { 
        name: name, 
            single_line_address: single_line_address, 
            latitude: latitude,
            longitude: longitude,
            apple_card: apple_card,
            apple_id: apple_id,
            google_id: google_id,
            fb_id: fb_id, 
            images: images,
            street: street,
            city: city,
            postcode: postcode,
            country: country,
            description: description,
            website: website,
            phone: phone,
            email: email,
            baby_change: baby_change,
            parking: parking,
            close_transport: close_transport,
            buggy: buggy,
            category: category,
            menu_link: menu_link,
            kids_menu_link: kids_menu_link,
            slug: slug,
            reservations: reservations, 
            licenced: licenced,
            work_friendly: work_friendly,
            onsite_cafe_restaurant: onsite_cafe_restaurant,
            table_service: table_service,
            delivery: delivery,
            pickup: pickup,
            takeout: takeout,
            walk_ins: walk_ins,
            walk_ins_only: walk_ins_only,
            customer_toilets: customer_toilets,
            gift_vouchers: gift_vouchers,
            venue_hire: venue_hire,
            cuisine: cuisine,
            special_notes: special_notes,
            meal_type: meal_type,
            vegetarian_options: vegetarian_options,
            vegan_options: vegan_options,
            healthy_options: healthy_options,
            organic_options: organic_options,
            halal_options: halal_options,
            great_coffee: great_coffee,
            great_cake: great_cake,
            snacks_available: snacks_available,
            allergy: allergy,
            lots_of_space: lots_of_space,
            group_friendly: group_friendly,
            large_group_space: large_group_space,
            breastfeeding: breastfeeding,
            highchairs: highchairs,
            kids_menu: kids_menu,
            kids_utensils: kids_utensils,
            BYO_infant_food: BYO_infant_food,
            play: play,
            seating: seating,
            dog: dog,
            wifi: wifi,
            other_facilities: other_facilities, 
            disability: disability,
            good_for: good_for,
            permanently_closed: permanently_closed,
            temporarily_closed: temporarily_closed,
            kid_friendly: kid_friendly,
            not_for_kids: not_for_kids,
            verified_by_owner: verified_by_owner,
            kid_restrictions: kid_restrictions,
    };
    
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



