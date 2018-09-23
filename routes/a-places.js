var express = require("express");
// with this we are swapping "app" for "router"
var router = express.Router();
var Place = require("../models/place");
var middleware = require("../middleware");
var request = require('request-promise');



//APPLE MAP - show apple map of places
router.get("/a-map", middleware.isLoggedIn, function(req, res) {
    //get all places from the db
    Place.find({}, function(err, allPlaces) {
        if (err) {
            console.log(err);
        }
        else {
            //res.render("places/index");

            res.render("places/a-map", { places: allPlaces, currentUser: req.user, page: 'map' });

        }
    });
});


//A-NEW - show form to create new apple place
router.get("/a-new", function(req, res) {
    // var name = req.params.name;
    // var name = req.query.name;
    // var formattedAddress = req.query.formattedAddress;
    // var latitude = req.query.latitude;
    // var longitude = req.query.longitude;
    // var muid = req.query.muid;
    // var _wpURL = req.query._wpURL;
    // var name = JSON.parse(txt);
    // console.log(_wpURL);
    res.render("places/a-new", { page: 'new' });
});

//---------------------------------------------------------------------------------------------------------------

//FB-SEARCH - search FB using Apple place
router.get("/fb-search", middleware.isLoggedIn, function(req, res) {
    var searchQuery = req._parsedUrl.search;
    if (req.query.name) {
        var q = req.query.name;
        // console.log(q);
    }
    if (req.query.longitude) {
        var longitude = req.query.longitude;
        // console.log(longitude);
    }
    if (req.query.latitude) {
        var latitude = req.query.latitude;
        // console.log(latitude);
    }
    // you need permission for most of these fields
    const userFieldSet = 'id, name, location, checkins, link, rating_count, overall_star_rating, photos{images}, price_range, single_line_address, picture, category_list, cover, engagement, website';
    var coords = latitude + ", " + longitude;
    //var coords = '55.8480, -4.4128';
    var radiusKm = '1000'; //in meters 
    var limit = 30;

    const options = {
        method: 'GET',
        //uri: `https://graph.facebook.com/v3.0/search?type=place&fields=name,checkins,picture&categories=["FOOD_BEVERAGE"]&center=55.8480,-4.4128&distance=1000`,
        uri: `https://graph.facebook.com/v3.0/search?type=place`,
        qs: {
            access_token: process.env.access_token,
            fields: userFieldSet,
            center: coords,
            distance: radiusKm,
            q: q,
            limit: limit,
        }
    };
    request(options)
        .then(fbRes => {
            var place = JSON.parse(fbRes);
            // if (place.data.length == 0) {
            //     res.redirect("a-new");
            // }
            // else {
            //res.json(place);

                res.render('places/list', { place: place, searchQuery: searchQuery });
            // }
        })
        .catch(function(err) {
            // API call failed...
            res.status(err).send("failed to return response - ");
        });
});


//---------------------------------------------------------------------------------------------------------------

//G-SEARCH - search Google using Apple place
router.get("/g-search", middleware.isLoggedIn, function(req, res) {
    var searchQuery = req._parsedUrl.search;
    const key = 'AIzaSyBspXmmxN0uaVfTHsoc8m4bSTvQ9nIcPFk';

    if (req.query.name) {
        var name = req.query.name;
        // console.log(q);
    }
    if (req.query.longitude) {
        var longitude = req.query.longitude;
        // console.log(longitude);
    }
    if (req.query.latitude) {
        var latitude = req.query.latitude;
        // console.log(latitude);
    }

    var radius = '250';

    // you need permission for most of these fields
    const userFieldSet = 'address_component,adr_address,alt_id,formatted_address,geometry,icon,id,name,permanently_closed,photo,place_id,scope,type,url,utc_offset,vicinity';
    var coords = latitude + "," + longitude;

    const options = {
        method: 'GET',
        uri: `https://maps.googleapis.com/maps/api/place/nearbysearch/json?`,
        qs: {
            access_token: process.env.access_token,
            fields: userFieldSet,
            location: coords,
            radius: radius,
            keyword: name,
            key: key,
        }
    };
    request(options)
        .then(fbRes => {
            var googlePlaces = JSON.parse(fbRes);
            // console.log(googlePlaces);
            //res.json(googlePlaces);
            res.render('places/g-search', { place: googlePlaces, searchQuery: searchQuery });
        })
        .catch(function(err) {
            // API call failed...
            res.status(err).send("failed to return response - ");
        });

});


//---------------------------------------------------------------------------------------------------------------


// part of fuzzy search
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

//exporting "router"
module.exports = router;
