import mongoose from "mongoose";

const modelSchema = new mongoose.Schema({
    email :{
        type : String,
        required : true
    },
    leetcode_username :{
        type: String,
        default : ""
    },
    codechef :{
        type : Boolean,
        default : false
    },
    codeforces :{
        type : Boolean,
        default : false
    }
})

export const Model = mongoose.model("Model", modelSchema);
