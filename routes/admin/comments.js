const express = require("express");
const router = express.Router();
const Post = require("../../models/Post");
const Comment = require("../../models/Comment");


router.all('/*', (req, res, next)=>{
    req.app.locals.layout= 'admin';
    next()
})
router.get('/', (req, res)=>{

    Comment.find({user: '62e0eddcc7d0751573052855'}).lean().populate('user').then(comments =>{
        res.render('admin/comments', {comments: comments})
    })
    
})
router.post("/", (req, res) => {
  Post.findOne({ _id: req.body.id }).then((post) => {
    const newComment = new Comment({
      user: req.user.id,
      body: req.body.body,
      date: req.body.date
    });

    post.comments.push(newComment);

    post.save().then((savedPost) => {
      newComment.save().then((savedComment) => {
        req.flash('success_message', 'Your comment will be reviewed in a second')
        res.redirect(`/post/${post.id}`);
      });
    });
  });
});
// router.delete("/:id", (req,res)=>{
//     Comment.deleteOne({_id: req.params.id }).then(result=>{
//        Post.findByIdAndUpdate({comments: req.params.id},{$pull:{comments: req.params.id}},(err, data)=>{
//         if(err) console.log(err)
//         res.redirect("/admin/comments")
//        })
      
//     })
// })


router.delete('/:id', (req, res)=>{


    Comment.remove({_id: req.params.id}).then(deleteItem=>{

        Post.findOneAndUpdate({comments: req.params.id}, {$pull: {comments: req.params.id}}, (err, data)=>{

           if(err) console.log(err);

            res.redirect('/admin/comments');

              });

        });

});

router.post('/approve-comment',(req, res)=>{
  // res.send("it works")
  // console.log(req.body.approveComment)
  Comment.findByIdAndUpdate(req.body.id, {$set:{ approveComment: req.body.approveComment}}, (err, result)=>{
    if(err) return err;
    res.send(result)
  })
})




module.exports = router;
