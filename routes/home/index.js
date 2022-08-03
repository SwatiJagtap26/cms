const express = require("express");
const router = express.Router();
const Post = require("../../models/Post");
const Category = require("../../models/Category");
const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const passport = require('passport');
const localStrategy= require('passport-local').Strategy;

router.all("/*", (req, res, next) => {
  req.app.locals.layout = "home";
  next();
});

router.get("/", (req, res) => {
  // req.session.swati = 'Swati Jagtap'
  // if(req.session.swati){
  //     console.log(`we found ${req.session.swati}`)
  // }
  const perPage = 10;
    const page = req.query.page || 1;

  Post.find({})

  .skip((perPage * page) - perPage)
  .limit(perPage)
    .lean()
    .then((posts) => {
      Post.count().then(postCount=>{
        Category.find({})
        .lean()
        .then((categories) => {
          res.render("home/index",
          { posts: posts, 
            categories: categories,
            current :parseInt(page),
            pages:  Math.ceil(postCount / perPage) });
        });
      })
     
    });
});
router.get("/about", (req, res) => {
  res.render("home/about");
});
//login
router.get("/login", (req, res) => {
  res.render("home/login")
});



passport.use(new localStrategy({usernameField: 'email'}, (email, password, done)=>{
  console.log(email);
  User.findOne({email : email}).then(user =>{
     if(!user) return done(null, false, {message: 'No user Found'});
      //user.testMethod();
      bcrypt.compare(password, user.password, (err, matched) =>{
        if(err) return err;
        if(matched){
          return done(null, user)
        }
        else{
          return done(null, false , {message: 'Incorrect password.'})
        }
      })
  
  })
}));
passport.serializeUser(function(user, done){
  done(null, user.id);
});
passport.deserializeUser(function(id, done){
  User.findById(id, function(err, user){
    done(err, user)
  })
})
router.post("/login", (req,res , next)=>{
    passport.authenticate('local',{
      successRedirect: '/admin',
      failureRedirect: '/login',
      failureFlash: true
    })(req, res, next)
})
//logout
router.get('/logout', function (req, res){

  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/login');
  });
 

});

//register
router.get("/register", (req, res) => {
  res.render("home/register");
});

router.post("/register", (req, res) => {
  let errors = [];

  //form validation from server side

  if (!req.body.firstName) {
    errors.push({ message: "please add a first name" });
  }
  if (!req.body.lastName) {
    errors.push({ message: "please add a last name" });
  }
  if (!req.body.email) {
    errors.push({ message: "please add an email" });
  }
  if (!req.body.password) {
    errors.push({ message: "please enter a password" });
  }
  if (!req.body.passwordConfirm) {
    errors.push({ message: "This field cannot be blank" });
  }
  if (req.body.password !== req.body.passwordConfirm) {
    errors.push({ message: "Password fields dont match" });
  }
  if (errors.length > 0) {
    res.render("home/register", {
      errors: errors,
      //refresh page but stll data ramain
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
    });
  } else {
    // already register user get error message
    User.findOne({ email: req.body.email }).then((user) => {
      if (!user) {
        const newUser = new User({
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          password: req.body.password,
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            newUser.password = hash;

            newUser.save().then((savedUser) => {
              req.flash(
                "success_message",
                "You are now registered, please login"
              );
              res.redirect("/login");
            });
          });
        });
      }else{
        req.flash('error_message','that email exist please login')
        res.redirect('/login')
      }
    });
  }
});

router.get("/post/:slug", (req, res) => {
  Post.findOne({slug : req.params.slug })
    .lean()
    .populate({path: 'comments', match:{approveComment: true}, populate: {path: 'user', model:'users'}})
    .populate('user')
    .then((post) => {
      Category.find({}).then((categories) => {
        res.render("home/post", { post: post, categories: categories });
      });
    });
});

module.exports = router;
