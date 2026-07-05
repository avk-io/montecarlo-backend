const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    password:{
        type:String,
        required:true,
        minlength:8,
    },
    refreshTokenHash:{
        type:String,
        default:null
    },
    refreshMeta:{
        ip:{type:String},
        userAgent:{type:String}
    },
    elo:{
        type:Number,
        default:1000
    }
})

userSchema.statics.getTier = function (elo) {
    if (elo < 1000) return "Unranked";
    if (elo < 1200) return "Trustworthy";
    if (elo < 1400) return "Established";
    if (elo < 1600) return "Elite";

    return "Legendary";
};

module.exports = mongoose.model("User",userSchema);

