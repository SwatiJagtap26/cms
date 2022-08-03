const express = require("express");
const app = express();
const path = require("path");
const exphbs = require("express-handlebars");
const Handlebars = require("handlebars");
const {
  allowInsecurePrototypeAccess,
} = require("@handlebars/allow-prototype-access");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const upload = require("express-fileupload");
const session = require("express-session");
const flash = require("connect-flash");
const { mongoDbUrl } = require("./config/database");
const passport = require("passport");

mongoose.Promise = global.Promise;

mongoose
  .connect(mongoDbUrl)
  .then((db) => {
    console.log("Mongo connected");
  })
  .catch((error) => console.log(error));

app.use(express.static(path.join(__dirname, "public")));

const { select, generateDate, paginate } = require("./helpers/handlebars-helpers");
//set view engine
// app.engine('handlebars',exphbs({defaultLayout : 'home'}))
// app.engine('handlebars', exphbs.engine({defaultLayout: 'home', helpers: {select: select,  generateDate :  generateDate }}));

app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "home",
    helpers: { select: select, generateDate: generateDate , paginate:paginate},
    handlebars: allowInsecurePrototypeAccess(Handlebars),
  })
);
app.set("view engine", "handlebars");

//Upload middleware
app.use(upload());

//body Parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//method override
app.use(methodOverride("_method"));

app.use(
  session({
    secret: "swatijagtapIloveCoding",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());
//passport
app.use(passport.initialize());
app.use(passport.session());

//local variables using Middleware
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.success_message = req.flash("success_message");
  res.locals.error_message = req.flash("error_message");
  res.locals.form_errors = req.flash("form_errors");
  res.locals.error = req.flash("error");
  next();
});

//load routes

const home = require("./routes/home/index");
const admin = require("./routes/admin/index");
const posts = require("./routes/admin/posts");
const categories = require("./routes/admin/categories");
const comments = require("./routes/admin/comments");

//use routes
app.use("/", home);
app.use("/admin", admin);
app.use("/admin/posts", posts);
app.use("/admin/categories", categories);
app.use("/admin/comments", comments);


const port = process.env.PORT || 4500;

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
