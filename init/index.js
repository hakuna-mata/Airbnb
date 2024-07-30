const mongoose = require("mongoose")
let initData = require("./data")
const Listing = require("../models/listing")

async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust")
}

main().then(()=>{
    console.log("Connection successful");
}).catch((e)=>{
    console.log(e);
})

async function init(){
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj)=>{
        return {...obj,owner:"668e635680a2436da9f66b08"}
    })
    await Listing.insertMany(initData.data)
    console.log("Data inserted successfully");
}

init()