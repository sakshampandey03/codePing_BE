import mongoose from "mongoose";

const userModelSchema = new mongoose.Schema({
    name :{
        type : String,
        required : true,
    },
    email :{
        type : String,
        required : true,
        unique : true,
    },
    avatar : {
        type : String,
    }
}, {timestamps : true})

export const User = mongoose.model('User', userModelSchema)