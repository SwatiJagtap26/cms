const express = require("express");
const router = express.Router();
const Post = require("../../models/Post");
const { isEmpty, uploadDir } = require("../../helpers/upload-helper");
const fs = require('fs');
const Category = require('../../models/Category')
const {userAuthenticated} = require("../../helpers/authentication")




router.all("/*",(req, res, next) => {
  req.app.locals.layout = "admin";
  next();
});

router.get("/", (req, res) => {
  Post.find({})
    .lean()
    .populate('category')
    .then((posts) => {
      res.render("admin/posts", { posts: posts });
    });

  //res.send('It Works')
});

router.get('/my-posts', (req, res)=>{
  Post.find({user: req.user.id})
  .lean()
  .populate('category')
  .then((posts) => {
    res.render("admin/posts/my-posts", { posts: posts });
  })
})

router.get("/create", (req, res) => {
  //  res.render('admin/posts')

  Category.find({}).lean().then(categories =>{
    res.render("admin/posts/create", {categories : categories});
  })
 
});

//to submit data we are using post method
router.post("/create", (req, res) => {

 

 
  //form validation from server side
  let errors = []
  if(!req.body.title){
    errors.push({message: 'please add a title'})

  }
  if(!req.body.body) {

    errors.push({message: 'please add a description'});

}
  if(errors.length > 0) {
    res.render('admin/posts/create', {
      errors: errors
    })
  }
  else{
    
  

 // let filename = 'takos.jpg';
 let file = req.files.file;
    let filename = Date.now()+'-' +file.name;

  if (!isEmpty(req.files)) {


    //to save image in upload folder
    file.mv("./public/uploads/" + filename, (err) => {
      if (err) throw err;
    });
    console.log('is not empty')
   }
  else{
    console.log('is  empty')
  }

 
  let allowComments = true;
  if (req.body.allowComments) {
    allowComments = true;
  } else {
    allowComments = false;
  }
  const newPost = new Post({
    user: req.user.id,
    title: req.body.title,
    status: req.body.status,
    allowComments: allowComments,
    body: req.body.body,
    category: req.body.category,
    file: filename
  });

  newPost
    .save()
    .then((savedPost) => {
      console.log(savedPost);
      req.flash('success_message', `Post ${savedPost.title} was created Successfully `)
      res.redirect("/admin/posts");
    })
    .catch((error) => {
      console.log(error,'could not save post');
    });
  }
  console.log(req.body)
});
//editing data

router.get("/edit/:id", (req, res) => {
  // res.send(req.params.id);
  Post.findOne({ _id: req.params.id })
    .lean()
    .then((posts) => {


      Category.find({}).lean().then(categories =>{
        res.render("admin/posts/edit", {posts: posts ,categories : categories});
      })
     
    });

  //  res.render('admin/posts/edit')
});
//updating
router.put("/edit/:id", (req, res) => {
  Post.findOne({ _id: req.params.id })
  .then((posts) => {
    if (req.body.allowComments) {
      allowComments = true;
    } else {
      allowComments = false;
    }
    posts.user = req.user.id;
    posts.title = req.body.title;
    posts.status = req.body.status;
    posts.allowComments = allowComments;
    posts.body = req.body.body;
    posts.category = req.body.category;

// to update images

    let file = req.files.file;
    let filename = Date.now()+'-' +file.name;

  if (!isEmpty(req.files)) {
    posts.file =filename
    file.mv("./public/uploads/" + filename, (err) => {
      if (err) throw err;
    });
    console.log('is not empty')
   }
  else{
    console.log('is  empty')
  }

 
    posts
      .save()
      .then((updatedPost) => {
        req.flash('success_message', 'Post was successfully updated')
        res.redirect("/admin/posts/my-posts");
      })
      .catch((error) => {
        console.log(`could not update data`);
      });
  });
});

//deleting
// router.delete("/:_id", (req, res) => {
//   console.log(req.params._id);
//   Post.deleteOne({ _id: req.params._id }).then((posts) => {
    
//     res.redirect("/admin/posts");
//   });
// });


router.delete("/:_id", (req, res) => {
  console.log(req.params._id);
  Post.findOne({ _id: req.params._id })
  .populate('comments')
  .then((post) => {
    fs.unlink(uploadDir  + post.file, (err)=>{
      if(!post.comments.length <1){
        post.comments.forEach(comment =>{
          comment.remove()
        })
      }
      post.remove().then(postRemover =>{
        req.flash('success_message', 'Post was successfully deleted')

        res.redirect("/admin/posts/my-posts");
      });
      
    })
    
  });
});

module.exports = router;
