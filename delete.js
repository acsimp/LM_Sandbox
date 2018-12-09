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