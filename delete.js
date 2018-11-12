<script>
    
    
    
    function submitFn() {
    
        let location = document.getElementById("geocoder").value;
        let geocoder = new mapkit.Geocoder({
            getsUserLocation: true
        });
        if (!location == "") {
        geocoder.lookup(location, function(error, data) {
            if (error) {
                console.log(error);
                return;
            }
                // print to div
                document.getElementById("latitide").value = data.results[0].coordinate.latitude;
                document.getElementById("longitude").value = data.results[0].coordinate.longitude;
                // submit form
                document.getElementById("searchForm").submit();
                
            });
        } else {
        document.getElementById("searchForm").submit();
    }
    } 
    
</script>


<script> // Geocoder
    // listen for geocoder input submission via enter key
    document.getElementById("geocoder").addEventListener("keypress", function(e) {
        if (e.keyCode === 13) { //checks whether the pressed key is "Enter"
            geocoderFn(e);
        }
    });
    // listen for search input submission via search button click
    // document.getElementById("geocoderBtn").addEventListener("click", geocoderFn);


    //search Mapkit JS Places API with search query
    function geocoderFn(data, callback) {

        // // call function to clear any exisiting search results
        clearPreviousAnnotations();

        let location = document.getElementById("geocoder").value;
        let geocoder = new mapkit.Geocoder({
            getsUserLocation: true
        });

        geocoder.lookup(location, function(error, data) {
            if (error) {
                console.log(error);
                return;
            }
            console.log(data);

                document.getElementById("geo-coords").innerHTML +=
                    '<h5 class="card-title mb-3">' + data.results[0].coordinate + '</h5>';

                map.addAnnotation(new mapkit.MarkerAnnotation(data.results[0].coordinate));
                let coordinate = new mapkit.Coordinate(data.results[0].coordinate.latitude, data.results[0].coordinate.longitude);
                map.setCenterAnimated(coordinate, true);
                document.getElementById("latitide").value = data.results[0].coordinate.latitude;
                document.getElementById("longitude").value = data.results[0].coordinate.longitude;
            });
            callback();
        };
        
            // function to clear previous results from map and list
    function clearPreviousAnnotations() {
        let annotations = map.annotations;
        map.removeAnnotations(annotations);
        document.getElementById('geo-coords').innerHTML = "";
    }

</script>