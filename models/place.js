var mongoose = require("mongoose");

// GeoJSON Schema
var PointSchema = new mongoose.Schema({
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], index: '2dsphere', required: true},
});

//schema setup
var placeSchema = new mongoose.Schema({
    
    // Basic Info ----------------------------------------
        name: { type: String, required: true },
        description: String,
        category: [],
        website: String,
        fb_link: String,
        phone: String,
        email: String,
        price: Number, // 1-4, relative, ££££
        slug: String,
        distance: Number,
        // free_entry: Boolean,
    
    // Location ------------------------------------------
        single_line_address: String,
        street: String,
        city: String,
        postcode: String,
        country: String,
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        location: { type: PointSchema, required: true },
        coordinate: {},
        
    // Hours ---------------------------------------------

        opening_hours: {
            mon: {open: Number, open_str: String, close: Number, close_str: String, closed: Boolean, allDay: Boolean },
            tue: {open: Number, open_str: String, close: Number, close_str: String, closed: Boolean, allDay: Boolean },
            wed: {open: Number, open_str: String, close: Number, close_str: String, closed: Boolean, allDay: Boolean },
            thu: {open: Number, open_str: String, close: Number, close_str: String, closed: Boolean, allDay: Boolean },
            fri: {open: Number, open_str: String, close: Number, close_str: String, closed: Boolean, allDay: Boolean },
            sat: {open: Number, open_str: String, close: Number, close_str: String, closed: Boolean, allDay: Boolean },
            sun: {open: Number, open_str: String, close: Number, close_str: String, closed: Boolean, allDay: Boolean },
        },
        // holidays hours?
        // cafe hours?
        // child restriction (licencing etc)?
        // early opening?
        other_opening_times: [ // custom generated for opening times of certain facilities e.g. cafe, creche, child friendly hours etc.
            { active: { type: Boolean }},
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
        google_id: { type: String, unique: true },
        apple_id: { type: String, unique: true },
        apple_card: String,
        // trip advisor ID or rating?
        // yelp
        // youtube
        // flicker
        // instagram
        // open table
        
    // media ---------------------------------------------    
        images: {
            card_img: String,
            },
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
        walk_ins: Boolean,
        walk_ins_only: Boolean,
        customer_toilets: Boolean,
        gift_vouchers: Boolean,
        venue_hire: Boolean,
        
    // Specialities (food types) -------------------------
        meal_type: { 
            breakfast: Boolean,
            lunch: Boolean,
            dinner: Boolean,
            coffee: Boolean,
            drinks: Boolean,
            treats: Boolean,
            },
            
        cuisine: [],
        vegetarian_options: Boolean,
        vegan_options: Boolean,
        allergy: { 
             friendly: Boolean,
             gluten: Boolean,
             nut: Boolean,
             dairy: Boolean,
             eggs: Boolean,
             special_notes: String,
        },
        healthy_options:  Boolean,
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
        baby_change: {
             ladies: { type: Boolean },
             gents: { type: Boolean },
             unisex: {type: Boolean },
             disabled: { type: Boolean },
             room: { type: Boolean }, // specific changing facility
             free_nappy: { type: Boolean },
        },
        parking: {
             onsite: { type: Boolean },
             nearby: { type: Boolean },
             free: { type: Boolean },
             parent_and_child: { type: Boolean },
        },
        close_transport: Boolean,
        buggy: {
             access: { type: Boolean },
             space_for: { type: Boolean },
             store: { type: Boolean },
        },
        breastfeeding: {
             friendly: { type: Boolean },
             discreet: { type: Boolean },
             no_purchase_req: { type: Boolean },
             feeding_room: { type: Boolean },
        },
        highchairs: {
             available: { type: Boolean },
             lots: { type: Boolean },
        },
        BYO_infant_food: {
            allowed: { type: Boolean },
            microwave: { type: Boolean },
            bottle_warmer: { type: Boolean }, 
        },
        kids_utensils: Boolean,
        kids_menu: Boolean,
        seating: {
             indoor: { type: Boolean },
             outdoor: { type: Boolean },
             picnic: { type: Boolean },
             party_size: { type: Boolean },
             fifty_plus_seats: { type: Boolean },
        },
        wifi: Boolean,
        play: {
             indoor: { type: Boolean },
             outdoor: { type: Boolean },
             toys: { type: Boolean },
             colouring: { type: Boolean },
             soft: { type: Boolean },
             creche: { type: Boolean },
        },
        dog: {
             friendly: { type: Boolean },
             water: { type: Boolean },
             inside: { type: Boolean },
             outside: { type: Boolean },
             restricted: { type: Boolean },
             good_walks: { type: Boolean }, 
             restrictions: String,
            // poo_bag: { type: Boolean },
        },
        other_facilities: [],
        
        
    // awards & status ---------------------------------------
        
    // Special Offers ----------------------------------------    
        
    // Disability --------------------------------------------
        disability: {
             friendly: Boolean,
             access: Boolean, // entry & elevators
             spacious: Boolean,
             parking: Boolean,
             toilet: Boolean,
             induction_loop: Boolean,
             ir_induction_loop: Boolean,
             braille: Boolean,
             autism: Boolean,
        },
        
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
        kid_friendly: Boolean,
        not_for_kids: Boolean,
        kid_restrictions: String,
        verified_by_owner: Boolean,
        temporarily_closed: Boolean,
        // new_management: {
        //     date: String,
        //     state: Boolean,
        // },
        // refurbished: {
        //     date: String,
        //     state: Boolean,
        // },
            
        // verified by us?
    
    // Good for -------------------------------------------
        good_for: {
            play: Boolean,
            party: Boolean,
            large_groups: Boolean,
            supervised_visits: Boolean,
            food: { type: Boolean },
            nappy_change: { type: Boolean },            
            age_goup: {
                newborn: Boolean, // 0-1 mo
                baby: Boolean, // <1 yr
                toddler: Boolean, // 1-3 yrs
                pre_school: Boolean, // 3-5 yrs
                school: Boolean, // 5+ yrs
            }, 
        },
        
    // Review Data / Engagement ---------------------------
        comments: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }],
        checkins: Number,
        tips: [],
        disability_review: [],
        ratings: {
            overall:{
               mean: {type: Number, default: 0 },
               count: {type: Number, default: 0 },
               five_count: {type: Number, default: 0 },
               four_count: {type: Number, default: 0 },
               three_count: {type: Number, default: 0 },
               two_count: {type: Number, default: 0 },
               one_count: {type: Number, default: 0 },
            },
            cost:{
               mean: {type: Number, default: 0 },
               count: {type: Number, default: 0 },
            },
            baby_change:{
               mean: {type: Number, default: 0 },
               count: {type: Number, default: 0 },
            },
            food:{
               mean: {type: Number, default: 0 },
               count: {type: Number, default: 0 },
            },
            play:{
               mean: {type: Number, default: 0 },
               count: {type: Number, default: 0 },
            },
            staff:{
               mean: {type: Number, default: 0 },
               count: {type: Number, default: 0 },
            },
            breastfeeding:{
               mean: {type: Number, default: 0 },
               count: {type: Number, default: 0 },
            },
            //BF friendly
            //Healthy eating
            //Changing Facilities
            //Children's facilities
            //Cleanliness
            //disability
            //staff_attitude
            //friendliness
        },            
        //Excellence awards
        
    });

module.exports = mongoose.model("Place", placeSchema);