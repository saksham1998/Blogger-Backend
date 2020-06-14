const express = require('express');
const auth = require('../middlewares/auth');
const Blog = require('../../db/models/Blog');

const router = express.Router();


// Create Blog
router.post('/new',auth,async (req,res)=>{
    try{   
        const {title,content} = req.body;
        const blog = new Blog({title,content,author:req.user._id})
        await blog.save()
        res.status(201).send({message:'Blog Created Successfully',blog})
    }catch(e){
        res.status(500).send({message:e.message,blog:null})
    }
})

// Update Blog
router.patch('/update/:id',auth,async (req,res)=>{
    try{
        const blog = await Blog.findOne({_id:req.params.id});
        if(req.user._id.toString()!==blog.author.toString()) throw new Error('You cannot update someone else\'s blogs')

        let fields = Object.keys(req.body)
        const validFields = ['title','content'];
        const isValid = fields.every(field=>{
            return validFields.includes(field)
        })
        if(!isValid) throw new Error('Fields you are trying to access are either not valid or not accessible')

        fields.forEach(field=>{
            blog[field] = req.body[field]
        })
        console.log(blog)
        let updated_blog = await blog.save()
        res.status(200).send({message:'Blog with given id is updated',updated_blog})
    }catch(e){
        res.status(404).send({message:e.message,blog:null})
    }
})

// Delete Blog
router.delete('/delete/:id',auth,async (req,res)=>{
    try{
        let blog = await Blog.findOne({_id:req.params.id})
        if(!blog) throw new Error('No Blog present with given ID')
        if(req.user._id.toString()!==blog.author.toString()) throw new Error('You cannot update someone else\'s blogs')
        await blog.remove()
        res.status(200).send({message:'Blog with given id is deleted',blog:null})
    }catch(e){
        res.status(404).send({message:e.message,blog:null})
    }
})

// Delete All My Blogs
router.get('/delete/all',auth,async (req,res)=>{
    try{
        await Blog.deleteMany({author:req.user._id});
        res.status(200).send({message:'All blogs deleted from your profile',blogs:null})
    }catch(e){
        res.status(404).send({message:e.message,blogs:null})
    }
})

// Like Someone's Blog
router.get('/like/:id',auth,async(req,res)=>{
    try{
        let id = req.params.id
        let blog = await Blog.findOne({_id:id}) 
     
        if(!blog) throw new Error('Please Give Valid Blog ID')
     
        if(blog.author.toString()=== req.user._id.toString()) throw new Error('you cannot like your own blog')
     
        if(req.user.likedBlogs.includes(id)) throw new Error('User can like blog only one time')

        blog.likes+=1;
        await blog.save()
        req.user.likedBlogs.push(id)
        await req.user.save()

        res.status(200).send({message:'Blog with give ID is liked and stored in your profile',blog})
    }catch(e){
        res.status(404).send({message:e.message,blog:null})
    }
})

// List of Blogs
router.get('/all',async(req,res)=>{
    try{
        const blogs = await Blog.find({},{title:1,content:1,likes:1}).limit(10)
        res.status(200).send({message:'List of Blogs',blogs})
    }catch(e){
        res.status(404).send({message:e.message,blogs:null})
    }
})

// Add Comment
router.post('/comment/:id',async (req,res)=>{
    try{
        let id = req.params.id
        let blog = await Blog.findOne({_id:id}) 
        if(!blog) throw new Error('Please Give Valid Blog ID')
        if(blog.author.toString()=== req.user._id.toString()) throw new Error('you cannot like your own blog')

        blog.comments.push({comment,user:req.user.name})
        await blog.save()

        res.status(200).send({message:'Commented Successfully!!!',blog})
    }catch(e){
        res.status(404).send({message:e.message,blog:null})
    }
})

// Show Comments
router.get('/show-comments/:id',async(req,res)=>{
    try{
        let blog = await Blog.findOne({_id:req.params.id});
        if(! blog) throw new Error('Please Give Valid Blog ID')

        res.status(200).send({message:'Comments List',comments:blog.comments})
    }catch(e){
        res.status(404).send({message:e.message,blog:null})
    }
})

module.exports = router