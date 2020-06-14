const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Blog = require('../models/Blog');
require('dotenv').config()

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        minlength:2,
        trim:true,
        lowercase:true
    },
    mail:{
        type:String,
        required:true,
        unique:true,
        minlength:6,
        trim:true,
        validate(value){
            if(! validator.isEmail(value)) throw new Error('Email is not correct')
        }
    },
    password:{
        type:String,
        required:true,
        minlength:6,
        trim:true
    },
    tokens:[
        {
            token:{
                type:String,
                required:true
            }
        }
    ],
    likedBlogs:[mongoose.Schema.Types.ObjectId]
});


userSchema.virtual('blogs',{
    ref:'Blog',
    localField:'_id',
    foreignField:'author'
})

userSchema.methods.generateJWTToken = async function(){
    const token = jwt.sign({id:this._id.toString()},process.env.JWT_SECRET)
    this.tokens.push({token})
    await this.save()
    return token
} 

userSchema.statics.checkCredentials = async (mail,password)=>{
    let user = await User.findOne({mail})
    if(!user) throw new Error('Email is not registered')

    if(!await bcrypt.compare(password,user.password)) throw new Error('Password is not correct')

    return user
}

userSchema.pre('save', async function(next){
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password,8);
    }
    next()
})

userSchema.pre('remove',async function(next){
    await Blog.deleteMany({author:this._id})
    next()
})

const User = mongoose.model('User',userSchema);

module.exports = User