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
    contact : {
        type : String,
        required : true,
        unique : true
    },
    birthDate : {
        type : Object,
        required : true, 
    },
    profileImage : {
        type : String,
        required : true
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
        enum: ['online', 'offline', 'away', 'busy'],
        default: 'offline',
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
    }
});

module.exports = mongoose.model("User", userSchema);