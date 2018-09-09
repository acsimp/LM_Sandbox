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

    // Hours ---------------------------------------------
        opening_hours: [
            { "key": "mon_open", "value": String },
            { "key": "mon_close", "value": String },
            { "key": "tue_open", "value": String },
            { "key": "tue_close", "value": String },
            { "key": "wed_open", "value": String },
            { "key": "wed_close", "value": String },
            { "key": "thu_open", "value": String },
            { "key": "thu_close", "value": String },
            { "key": "fri_open", "value": String },
            { "key": "fri_close", "value": String },
            { "key": "sat_open", "value": String },
            { "key": "sat_close", "value": String },
            { "key": "sun_open", "value": String },
            { "key": "sun_close", "value": String },
        ],
        // holidays hours?
        // cafe hours?
        // child restriction (licencing etc)?
        // early opening?
        
    // Integrations --------------------------------------
        fb_id: String,
        google_id: String,
        apple_id: { type: String, required: true },
        // trip advisor ID or rating?
        // yelp
        // youtube
        // flicker
        // instagram
        
    
    // Location ------------------------------------------
        single_line_address: String,
        street: String,
        city: String,
        postcode: String,
        country: String,
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        
    // media ---------------------------------------------    
        images: [],
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

    
    // Payment Methods -----------------------------------
    
    // Size ----------------------------------------------
        // large group space
        // table size
        lots_of_space: Boolean,
        group_friendly: Boolean,
        large_group_space: Boolean,
        party_size_seating: Number, // up to number
        fifty_plus_seats: Boolean, 
    
    // Attributes ----------------------------------------
        baby_change: [
            { ladies: { type: Boolean, default: false }},
            { gents: { type: Boolean, default: false }},
            { disabled: { type: Boolean, default: false }},
            { room: { type: Boolean, default: false }}, // specific changing facility
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
        ],

        wifi: { type: Boolean, default: false },
        // Play - group these?
        play: [
            { indoor: { type: Boolean, default: false }},
            { outdoor: { type: Boolean, default: false }},
            { toys: { type: Boolean, default: false }},
            { colouring: { type: Boolean, default: false }},
            { soft: { type: Boolean, default: false }},
        ],
        free_nappy: { type: Boolean, default: false },
        dog: [
            { friendly: { type: Boolean, default: false }},
            { water: { type: Boolean, default: false }},
            //{ poo_bag: { type: Boolean, default: false }},
        ],
        other_attributes: [],
        
        
    // awards & status----------------------------------------
        
        
        
    // Disability --------------------------------------------
        disability: [
            { friendly: Boolean },
            { access: Boolean }, // entry & elevators
            { parking: Boolean },
            { toilet: Boolean },
            { induction_loop: Boolean },
            { ir_induction_loop: Boolean },
            { braille: Boolean },
            // autism friendly?
            
        ],
    // Staff Attitude
    
    // Atmosphere  --------------------------------
        // casual, formal, child-centric, loud, quiet, calm, energetic, 
        
    // Cleanliness --------------------------------------    
        
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
        not_for_kids: { type: Boolean, default: false },
        verified_by_owner: { type: Boolean, default: false },
        // verified by us?
    
    // Good for -------------------------------------------
        // breakfast, lunch, dinner, socialise, play, party, large gorup, supervised visits
        // age goup - Newborn (0-1mo), baby (<1yr), toddler (1-3 yrs), pre-school (3-5yrs), school age (5+yrs)
        
    // Review Data / Engagement ---------------------------
        comments: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }],
        ratings: [],
        checkins: Number,
        tips: [],
        disability_review: [],
        //Overall
        //BF friendly
        //Healthy eating
        //Changing Facilities
        //Children's facilities
        //Excellence awards
        //disability

    });

module.exports = mongoose.model("Place", placeSchema);