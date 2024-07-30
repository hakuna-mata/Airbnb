const dotenv = require("dotenv")
dotenv.config()
const express = require("express")
const app = express();
const mongoose = require("mongoose")
const path = require("path")
app.set("view engine","ejs")
app.set("views",path.join(__dirname,"views"))
app.use(express.urlencoded({extended:true}))
const methodOverride = require("method-override")
app.use(methodOverride("_method"))
const ejsMate = require("ejs-mate")
app.engine("ejs",ejsMate)
app.use(express.static(path.join(__dirname,"/public")))
const { error } = require("console");
const listingsRouter = require("./routes/listing.js")
const reviewsRouter = require("./routes/review.js")
const userRouter = require("./routes/user.js")
const ExpressError = require("./utils/ExpressError")
const dburl = process.env.ATLASDB_URL
const cookieParser = require("cookie-parser")
app.use(cookieParser("secretCode"))
const session = require("express-session")
const MongoStore = require("connect-mongo")           //To store session related info in mongo atlas instead of ls.

const store = MongoStore.create({
    mongoUrl:dburl,
    crypto:{
        secret:process.env.SECRET
    },
    touchAfter:24*3600
})

store.on("error",()=>{
    console.log("Error in mongo session store"+" "+err);
})

const sessionOptions = {
    store,
    secret:process.env.SECRET,resave:false,saveUninitialized:true,cookie:{
    expires:Date.now()+7*24*60*60*1000,
    maxAge:7*24*60*60*1000,
    httpOnly:true
}}


const flash = require("connect-flash")
const passport = require("passport")
const LocalStrategy = require("passport-local")
const User = require("./models/user.js")



async function main(){
    // await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust")
    await mongoose.connect(dburl)
}

main().then(()=>{
    console.log("Connection successful");
}).catch((e)=>{
    console.log(e);
})

app.use(session(sessionOptions))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req,res,next)=>{
    res.locals.currUser=req.user
    res.locals.success = req.flash("success")
    res.locals.error=req.flash("error")
    next()
})

app.use("/listings",listingsRouter)
app.use("/listings/:id/reviews",reviewsRouter)
app.use("/",userRouter)

app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page not found"))
})

//ERR M/W
app.use((err,req,res,next)=>{
    let{statusCode=500,message="Something went wrong"}=err
    res.status(statusCode).render("listings/error.ejs",{message})
    // res.status(statusCode).send(message)
})

app.listen(8080,()=>{
    console.log("Listening on port 8080");
})

