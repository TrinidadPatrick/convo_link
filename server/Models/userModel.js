const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    password : {
        type : String,
        required : true,
        trim: true
        
    },
    firstname : {
        type : String,
        required : true,
        trim: true
    },
    lastname : {
        type : String,
        required : true,
        trim: true
        
    },
    birthdate : {
        type : Object,
        required : true, 
    },
    userBio : {
        type : String,
        default : null
    },
    gender : {
        type : String,
        required : true
    },
    profileImage : {
        type : String,
        default : null
    },
    Address : {
        type : Object,
        default : null
    },
    account_status : {
        type : {},
        default : {status : "Active", reasons : []}
    },
    profile_status: {
        type: String,
        enum: ['Online', 'Offline', 'Away', 'Busy'],
        default: 'Offline',
    },
    Role : {
        type : String,
        default : "User"
    },
    createdAt : {
        type : String,
        default: () => new Date().toISOString()
    },
    updatedAt : {
        type : String,
        default: () => new Date().toISOString()
    },
    isDeactivated : {
        type : Boolean,
        default : false
    },
    email_verified : {
        type : Boolean,
        default : false
    },
    otp : {
        type : String,
    },
    otpExpiry : {
        type : Date,
    },
    hobbies : {
        type : Array,
        default : []
    }
});

module.exports = mongoose.model("User", userSchema);