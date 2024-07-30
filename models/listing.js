const mongoose = require("mongoose")
const Review = require("./review.js")
const User = require("./user.js")

async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust")
}

// main().then(()=>{
//     console.log("Successful connection");
// }).catch(e=>e)

const listingSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String
    },
    image:{
        url:String,
        filename:String,
    },
    price:Number,
    location:String,
    country:String,
    reviews:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:Review
        }
    ],
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:User
    },
    geometry:{
        type: {
            type: String,
            enum: ['Point'],
            required: true
          },
          coordinates: {
            type: [Number],
            required: true
          }
    }
})


//Mongoose middleware
listingSchema.post("findOneAndDelete",async(listing)=>{
    if(listing){
        await Review.deleteMany({_id:{$in:listing.reviews}})
    }
})

const Listing = mongoose.model("Listing",listingSchema)
module.exports = Listing