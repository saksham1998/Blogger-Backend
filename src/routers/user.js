const express = require('express');
const User = require('../../db/models/User');
const auth = require('../middlewares/auth')
const Blog = require('../../db/models/Blog');

const router = express.Router();


// User Registration
router.post('/register',async(req,res)=>{
    try{
        const {name,mail,password} = req.body
        const user = new User({name,mail,password})
        const token = await user.generateJWTToken()

        res.status(201).send({message:'User Created Successfully',user,token})
    }catch(e){
        res.status(500).send({message:e.message,user:null,token:null})
    }
})

// User Login
router.post('/login',async(req,res)=>{
    try{
        const {mail,password} = req.body
        const user = await User.checkCredentials(mail,password)
        const token = await user.generateJWTToken()

        res.status(200).send({message:'User Logged In Successfully',user,token})
    }catch(e){
        res.status(404).send({message:e.message,user:null,token:null})
    }
})

// Profile
router.get('/me',auth,async(req,res)=>{
    try{
        await req.user.populate('blogs').execPopulate();
        const blogs = req.user.blogs;
        res.status(200).send({message:'User Profile',user:req.user,blogs,token:req.token})
    }catch(e){
        res.status(404).send({message:e.message,user:null,token:null})
    }
})

// Update Profile
router.patch('/me/update',auth,async(req,res)=>{
    try{
        const fields = Object.keys(req.body);
        const validFields = ['name','mail','password']
        const isValid = fields.every(field=>{
            return validFields.includes(field)
        })
        if(!isValid) throw new Error(' Fields you are trying to access are either not valid or not accessible')

        fields.forEach(field=>{
            req.user[field] = req.body[field]
        })
        let user = await req.user.save()     
        res.status(200).send({message:'Profile Update Successfully',user,token:req.token})

    }catch(e){
        res.status(404).send({message:e.message,user:null,token:null})
    }
})

// logout 
router.delete('/logout',auth,async(req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token!=req.token
        })
        await req.user.save()
        res.status(200).send({message:'Logout Successfull',user:null,token:null})
    }catch(e){
        res.status(404).send({message:e.message,user:null,token:null})
    }
})

// Logout All
router.delete('/logoutAll',auth,async(req,res)=>{
    try{
        req.user.tokens = []
        await req.user.save()
        res.status(200).send({message:'Logout All Successfull',user:null,token:null})
    }catch(e){
        res.status(404).send({message:e.message,user:null,token:null})
    }
})

// See other users
router.get('/all',async (req,res)=>{
    try{
        const users = await User.find({},{name:1})
        res.status(200).send({message:'List of Users',users,token:null})
    }catch(e){
        res.status(404).send({message:e.message,user:null,token:null})
    }
})

// Delete Me
router.delete('/me/delete',auth,async(req,res)=>{
    try{
        await req.user.remove()
        res.status(200).send({message:'Deleted your profile',user:null,token:null})
    }catch(e){
        res.status(404).send({message:e.message,user:null,token:null})
    }
})

// User Blog List
router.get('/me/blogs',auth,async(req,res)=>{
    try{
        await req.user.populate('blogs').execPopulate();
        const blogs = req.user.blogs;
        
        res.status(200).send({message:'Blogs List',blogs,token:req.token})
    }catch(e){
        res.status(404).send({message:e.message,blogs:null,token:null})
    }
})


// User Liked Blog List
router.get('/me/likedBlogs',auth,async(req,res)=>{
    const blogs = await Blog.find({_id:{$in:req.user.likedBlogs}})
    res.send(blogs)
    console.log(blogs)

    console.log(await req.user.populate('likedBlogs').execPopulate())
})


module.exports = router