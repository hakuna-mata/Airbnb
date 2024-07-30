const Listing = require("./models/listing");
const Review = require("./models/review.js");
const{listingSchema}=require("./schema.js")
const {reviewSchema} = require("./schema.js")
const ExpressError = require("./utils/ExpressError")

//Validate listing middleware
module.exports.validateListing = (req,res,next)=>{
    let ans = listingSchema.validate(req.body);
    if(ans.error){
        let errMsg = ans.error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg)
    }else{
        next()
    }
}

//Validate review middleware
module.exports.validateReview = (req,res,next)=>{
    let result = reviewSchema.validate(req.body);
    if(result.error){
        let errMsg = result.error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg)
    }else{
        next()
    }
}

//Authentication M/W
module.exports.isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;  //If user is not logged in then save this originalUrl,so he can redirect back
        req.flash("error","You must be logged in")  //to the same page where he was trying to access before login
        return res.redirect("/login")
    }
    next()
}

//Redirect M/W
module.exports.saveRedirectUrl = (req,res,next)=>{
    if(req.session.redirectUrl){      //Passport will reset the session id after login so we need to stor in locals as it 
        res.locals.redirectUrl=req.session.redirectUrl; //can be used anywhere.
    }
    next()
}

//Authorization M/W
module.exports.isOwner = async(req,res,next)=>{
    let{id}=req.params;
    let listing = await Listing.findById(id)
    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error","You are not the owner of this listing")
        return res.redirect(`/listings/${id}`)
    }
    next()
}

module.exports.isReviewAuthor = async(req,res,next)=>{
    let{id,reviewid}=req.params;
    let review = await Review.findById(reviewid)
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error","The review was not created by you")
        return res.redirect(`/listings/${id}`)
    }
    next()
}