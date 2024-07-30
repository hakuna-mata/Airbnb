const express = require("express")
const router = express.Router()
const wrapAsync = require("../utils/wrapAsync")
const Listing = require("../models/listing")
const {isLoggedIn, isOwner,validateListing} = require("../middleware.js")
const {index, renderNewForm,createListing,editListing,updateListing,showListing,destroyListing} = require("../controllers/listing.js")
const multer = require("multer")
const {storage} = require("../cloudConfig.js")
const upload = multer({storage})

router.route("/")
.get(wrapAsync(index))                                         //Index route
.post(isLoggedIn,upload.single("listing[image]"),validateListing,wrapAsync(createListing))   //Create route

router.get("/new",isLoggedIn,renderNewForm)                   //New route

router.route("/:id")
.get(wrapAsync(showListing))                                            //Show route  
.put(isLoggedIn,isOwner,upload.single("listing[image]"),validateListing,wrapAsync(updateListing))      //Update route
.delete(isLoggedIn,isOwner,wrapAsync(destroyListing))                 //Delete route

//Edit form
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(editListing))

module.exports = router;