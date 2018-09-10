var mongoose = require("mongoose");

//schema setup
var placeSchema = new mongoose.Schema({
    
    // Basic Info ----------------------------------------
        name: { type: String, required: true },
        description: String,
        category: [],
        website: String,
        phone: String,
        email: String,
        price: Number, // 1-4, relative, ££££
        // free_entry: Boolean,
    
    // Location ------------------------------------------
        single_line_address: String,
        street: String,
        city: String,
        postcode: String,
        country: String,
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        
    // Hours ---------------------------------------------
        opening_hours: [
            { mon_open: String },
            { mon_close: String },
            { mon_closed: Boolean },
            { tue_open: String },
            { tue_close: String },
            { tue_closed: Boolean },
            { wed_open: String },
            { wed_close: String },
            { wed_closed: Boolean },
            { thu_open: String },
            { thu_close: String },
            { thu_closed: Boolean },
            { fri_open: String },
            { fri_close: String },
            { fri_closed: Boolean },
            { sat_open: String },
            { sat_close: String },
            { sat_closed: Boolean },
            { sun_open: String },
            { sun_close: String },
            { sun_closed: Boolean },
        ],
        // holidays hours?
        // cafe hours?
        // child restriction (licencing etc)?
        // early opening?
        other_opening_times: [ // custom generated for opening times of certain facilities e.g. cafe, creche, child friendly hours etc.
            { active: { type: Boolean, default: false }},
            { name: String },
            { mon_open: String },
            { mon_close: String },
            { mon_closed: Boolean },
            { tue_open: String },
            { tue_close: String },
            { tue_closed: Boolean },
            { wed_open: String },
            { wed_close: String },
            { wed_closed: Boolean },
            { thu_open: String },
            { thu_close: String },
            { thu_closed: Boolean },
            { fri_open: String },
            { fri_close: String },
            { fri_closed: Boolean },
            { sat_open: String },
            { sat_close: String },
            { sat_closed: Boolean },
            { sun_open: String },
            { sun_close: String },
            { sun_closed: Boolean },
        ],
        
    // Integrations --------------------------------------
        fb_id: String,
        google_id: String,
        apple_id: { type: String, required: true },
        apple_card: String,
        // trip advisor ID or rating?
        // yelp
        // youtube
        // flicker
        // instagram
        // open table
        
    // media ---------------------------------------------    
        images: [
            {card_img: String },
            ],
        // social media
        // user uploaded
        // owner uploaded
        // cover
        // logo
        // tags - outside, inside, baby changing, food(adult), food (childrens), facilities, play area, toilets, disablity
        
    // Services ------------------------------------------
        menu_link: String,
        kids_menu_link: String,
        reservations: Boolean,
        licenced: Boolean,
        work_friendly: Boolean,
        onsite_cafe_restaurant: Boolean,
        table_service: Boolean,
        delivery: Boolean,
        pickup: Boolean,
        takeout: Boolean,
        walkins: Boolean,
        
        
    // Specialities (food types) -------------------------
        meal_type: [
            { breakfast: { type: Boolean, default: false }},
            { lunch: { type: Boolean, default: false }},
            { dinner: { type: Boolean, default: false }},
            { coffee: { type: Boolean, default: false }},
            { drinks: { type: Boolean, default: false }},
            ],
        food_type: [],
        vegetarian_options: { type: Boolean, default: false },
        vegan: { type: Boolean, default: false },
        allergy: [ 
            { friendly: { type: Boolean, default: false }},
            { gluten: { type: Boolean, default: false }},
            { nut: { type: Boolean, default: false }},
            { nut: { type: Boolean, default: false }},
            { dairy: { type: Boolean, default: false }},
            { eggs: { type: Boolean, default: false }},
        ],
        healthy_options: { type: Boolean, default: false },
        organic_options: Boolean,
        halal_options: Boolean,
        great_coffee: Boolean,
        great_cake: Boolean,
        snacks_available: Boolean,
        special_notes: String, // notes about unique or important features of place

    
    // Payment Methods -----------------------------------
    
    // Size ----------------------------------------------
        lots_of_space: Boolean,
        group_friendly: Boolean,
        large_group_space: Boolean,

    
    // Facilities ----------------------------------------
        baby_change: [
            { ladies: { type: Boolean, default: false }},
            { gents: { type: Boolean, default: false }},
            { disabled: { type: Boolean, default: false }},
            { room: { type: Boolean, default: false }}, // specific changing facility
            { free_nappy: { type: Boolean, default: false }},
        ],
        parking: [
            { onsite: { type: Boolean, default: false }},
            { nearby: { type: Boolean, default: false }},
        ],
        close_transport: { type: Boolean, default: false },
        buggy: [
            { access: { type: Boolean, default: false }},
            { lots_of_space: { type: Boolean, default: false }},
            { store: { type: Boolean, default: false }},
        ],
        breastfeeding: [
            { friendly: { type: Boolean, default: false }},
            { area: { type: Boolean, default: false }},
            { discreet: { type: Boolean, default: false }},
            { no_purchase_req: { type: Boolean, default: false }},
        ],
        feeding_room: { type: Boolean, default: false },
        highchairs: [
            { available: { type: Boolean, default: false }},
            { lots: { type: Boolean, default: false }},
        ],
        BYO_infant_food: [
            { allowed: { type: Boolean, default: false }},
            { microwave: { type: Boolean, default: false }},
        ],
        kids_utensils: { type: Boolean, default: false },
        kids_menu: { type: Boolean, default: false },
        seating: [
            { indoor: { type: Boolean, default: false }},
            { outdoor: { type: Boolean, default: false }},
            { picnic: { type: Boolean, default: false }},
            { party_size: { type: Boolean, default: false }},
            { fifty_plus_seats: { type: Boolean, default: false }},
        ],
        wifi: { type: Boolean, default: false },
        play: [
            { indoor: { type: Boolean, default: false }},
            { outdoor: { type: Boolean, default: false }},
            { toys: { type: Boolean, default: false }},
            { colouring: { type: Boolean, default: false }},
            { soft: { type: Boolean, default: false }},
            { creche: { type: Boolean, default: false }},
        ],
        dog: [
            { friendly: { type: Boolean, default: false }},
            { water: { type: Boolean, default: false }},
            { inside: { type: Boolean, default: false }},
            { outside: { type: Boolean, default: false }},
            { restricted: { type: Boolean, default: false }},
            //{ poo_bag: { type: Boolean, default: false }},
        ],
        other_attributes: [],
        
        
    // awards & status ---------------------------------------
        
    // Special Offers ----------------------------------------    
        
    // Disability --------------------------------------------
        disability: [
            { friendly: Boolean },
            { access: Boolean }, // entry & elevators
            { spacious: Boolean },
            { parking: Boolean },
            { toilet: Boolean },
            { induction_loop: Boolean },
            { ir_induction_loop: Boolean },
            { braille: Boolean },
            // autism friendly?
            
        ],
        
    // Staff Attitude
        // perhaps just a rating
        
    // Atmosphere  --------------------------------
        // casual, formal, child-centric, loud, quiet, calm, energetic, 
        
        
    // Cleanliness --------------------------------------    
        // maybe just an overall rating?
        
    // Ownership ----------------------------------------
        createdAt: { type: Date, default: Date.now },
        author: {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            username: String
        },
        // Owner: {
        //     id: {
        //         type: mongoose.Schema.Types.ObjectId,
        //         ref: "BusinessUser"
        //     },
        //     username: String
        // },
        
    // Flags ----------------------------------------------
        permanently_closed: { type: Boolean, default: false },
        kid_friendly: { type: Boolean },
        not_for_kids: { type: Boolean },
        verified_by_owner: { type: Boolean, default: false },
        // verified by us?
    
    // Good for -------------------------------------------
        good_for: [
            { play: Boolean },
            { party: Boolean },
            { large_groups: Boolean },
            { supervised_visits: Boolean },
            { age_goup: [
                { newborn: Boolean }, // 0-1 mo
                { baby: Boolean }, // <1 yr
                { toddler: Boolean }, // 1-3 yrs
                { pre_school: Boolean }, // 3-5 yrs
                { school: Boolean }, // 5+ yrs
            ]}, 
        ],
        
    // Review Data / Engagement ---------------------------
        comments: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }],
        checkins: Number,
        tips: [],
        disability_review: [],
        ratings: [
            //Overall
            //BF friendly
            //Healthy eating
            //Changing Facilities
            //Children's facilities
            //Cleanliness
            //disability
            //staff_attitude
            //friendliness
        ],            
        //Excellence awards
    });

module.exports = mongoose.model("Place", placeSchema);