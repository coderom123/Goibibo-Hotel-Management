if (process.env.NODE_ENV != "production")
{
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = 8080;
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo"); //cloud - mongo
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");



const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";// for localhost use this 
// const dbUrl = process.env.ATLASDB_URL;

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err)=> {
    console.log(err);
  });

async function main(){
  // await mongoose.connect(dbUrl);
  await mongoose.connect(MONGO_URL); // for localhost use this 
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


const sessionOptions = {
  secret: "mysupersecretcode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // day * hours * minutes * seconds * mili sec.
    maxAge: + 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

// app.get("/",(req,res)=> {
//   res.send("hi , i am root / ");
// });

//mongo-session store from 4.36 min 

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate())); //check

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// app.get("/demouser", async (req, res) => {
//   let fakeUser = new User({
//     email: "student@gmail.com",
//     username : "delta-student",
//   });

//   let registeredUser = await User.register(fakeUser , "helloworld");
//   res.send(registeredUser);
// });


app.use("/listings" , listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);


app.all("*",(req,res,next) => {
  next(new ExpressError(404, "page Not Found"));
});


app.use((err, req, res, next) => {
  let { statusCode = 500, message = "something went wrong"} = err;

  res.status(statusCode).render("error.ejs", { message });
});


app.listen(8080,() => {
    console.log("server is listining to the port");
});
