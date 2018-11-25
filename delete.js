        var MarkerAnnotation = mapkit.MarkerAnnotation;
        var place = new mapkit.Coordinate(placeLat, placeLng);
        
        mapkit.init({
            authorizationCallback: function(done) {
                var xhr = new XMLHttpRequest();
                xhr.open("GET", "/services/jwt");
                xhr.addEventListener("load", function() {
                    done(this.responseText);
                });
                xhr.send();
            }
        });
        // var map = new mapkit.Map("map");
        
        var map = new mapkit.Map("map", {
        region: region,
        showsUserLocation: true,
        showsUserLocationControl: true,
        // tracksUserLocation: true,
        showsMapTypeControl: true,
        showsCompass: mapkit.FeatureVisibility.Visible,
        title: mapkit.FeatureVisibility.Visible,
        isRotationEnabled: true,
        isScrollEnabled: true,
        isZoomEnabled: true,
        showsScale: true,
      });
        
        // Setting properties on creation:

        // Setting properties after creation:
        var placeAnnotation = new MarkerAnnotation(place);
        placeAnnotation.color = "#969696"; 
        placeAnnotation.title = "Work";
        placeAnnotation.subtitle = "Apple Park";
        placeAnnotation.selected = "true";
        placeAnnotation.glyphText = "";
        
        // Add and show both annotations on the map
        map.showItems([placeAnnotation]);
        
      