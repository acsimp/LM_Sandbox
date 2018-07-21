const userFieldSet = 'id, about, name, location, checkins, link, rating_count, overall_star_rating, description, website, phone, photos{images}, hours, engagement, restaurant_specialties, restaurant_services, price_range, single_line_address, is_verified, picture{url}, category_list, cover, is_permanently_closed';
  const options = {
    method: 'GET',
    //uri: `https://graph.facebook.com/v3.0/${req.params.id}?fields=about,location,checkins,name,parking,link,rating_count,overall_star_rating,description,website,phone,photos{album,images},hours,engagement,restaurant_specialties,restaurant_services,price_range,single_line_address,is_verified,picture{url},category_list,cover,is_permanently_closed&access_token=2133299740261243%7CaxqRiyPS1AHTSXsP58rRHJCMelE`,
    uri: `https://graph.facebook.com/v3.0/${req.params.id}`,
    qs: {
      access_token: process.env.access_token,
      fields: userFieldSet
    }
  };
  request(options)
    .then(fbRes => {
      var place = JSON.parse(fbRes);
      //if place.website does not contain http:// or https:// it simple adds to the end of current url
      //this code checks for http and adds if missing
      if (place.website){
    var tarea = place.website;
    //console.log(tarea);
    if (tarea.indexOf("http://") == 0 || tarea.indexOf("https://") == 0) {
    } else {
      place.website = "http://"+place.website;
        //console.log(place.website);
    }
      }
      
//       function getImageDirectoryByFullURL(url){
//       return url.split('/').pop()
// }

//a step by step breakdown
// var fburl = place.link;
//     fburl = fburl.split('/'); //url = ["serverName","app",...,"bb65efd50ade4b3591dcf7f4c693042b"]
//     fburl = fburl.pop();      //url = "bb65efd50ade4b3591dcf7f4c693042b"
//   console.log("fburl " + fburl);           //return "bb65efd50ade4b3591dcf7f4c693042b"

      
//       var fbURL = place.link;
//       var lastURLSegment = fbURL.substr(fbURL.lastIndexOf('/') - 1);
//       console.log(place.link);
//       console.log(lastURLSegment);

var url = String(place.link);
// Get the last path:
url = url.split("/");
var page = url[url.length-2];
console.log(page);

      //console.log(place);
      //res.json(place);
      res.render('place', { place: place });
    });
});  