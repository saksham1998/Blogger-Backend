const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        minlength:5,
        trim:true,
        unique:true
    },
    content:{
        type:String,
        required:true,
        minlength:10,
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    likes:{
        type:Number,
        default:0
    },
    comments:[
        {
            comment:{type:String,required:true},
            user:{type:String,required:true},
            time:{type:Date,default:Date.now()}
        }
    ]
});

const Blog = mongoose.model('Blog',blogSchema)

module.exports = Blog