const express = require('express');
const router= express.Router()
const Post  = require('../../models/Post')
const { faker } = require('@faker-js/faker');
const Category = require('../../models/Category')
const Comment = require('../../models/Comment')
const {userAuthenticated} = require("../../helpers/authentication")


router.all('/*', (req, res, next)=>{
    req.app.locals.layout= 'admin';
    next()
})

router.get('/', (req, res)=>{
    const promises = [
        Post.count().exec(),
        Category.count().exec(),
        Comment.count().exec()
    ]
   Promise.all(promises).then(([postCount , categoryCount, commentCount])=>{
      res.render('admin/index',{postCount: postCount, 
        categoryCount: categoryCount, 
        commentCount: commentCount})

   })

        // Post.count({}).then(postCount =>{
        //     res.render('admin/index',{postCount:postCount})
        // })
    
})
router.get('/dashboard', (req, res)=>{
    res.render('admin/dashboard')
})


// router.post('/generate-fake-posts', (req, res)=>{
//     // res.send("it works")
//     for(let i = 0; i< req.body.amount; i++){
//         let post = new Post();
//         post.title = faker.name.title();
//         post.status = 'public';
//         post.allowComments = faker.random.boolean();
//         post.body = faker.lorem.sentence();

//         post.save(function (err){
//             if(err) throw err;
//         })
        
        
//     }
//     res.redirect('/admin/posts')
// })

router.post('/generate-fake-posts', (req, res)=>{


    for(let i = 0; i < req.body.amount; i++){

        let post = new Post();

        // post.title = faker.name.title();
        // post.status = 'public';
        // post.allowComments = faker.random.boolean();
        // post.body = faker.lorem.sentence();
        // post.slug = faker.random.locale();

        post.title = faker.random.locale();
        post.status = 'public';
        post.allowComments = faker.helpers.arrayElement([true , false]);
        post.body = faker.lorem.sentence();
         post.slug = faker.random.locale();
        post.save(function(err){

            if (err) throw err;

        });

    }

    res.redirect('/admin/posts');

});


module.exports = router;