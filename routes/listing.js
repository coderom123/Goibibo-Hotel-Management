const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");
const multer  = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

const listingController = require("../controllers/listings.js");

router
  .route("/")
   .get(wrapAsync(listingController.index))//index
   .post(isLoggedIn,
    upload.single("listing[image]"),validateListing,//multer
    wrapAsync (listingController.createListing)
  );//create

   
 //new route
 router.get("/new", isLoggedIn,listingController.renderNewForm); 

// //Index Route
// router.get("/",wrapAsync(listingController.index));
//create route
//  router.post("/",isLoggedIn,validateListing, wrapAsync (listingController.createListing));
router
     .route("/:id")
     .get(wrapAsync (listingController.showListing))//show route
     .put(isLoggedIn,
          isOwner,
          upload.single("listing[image]"),
          validateListing,
          wrapAsync(listingController.updateListing))//update route
      .delete(isLoggedIn,
              isOwner,
              wrapAsync(listingController.destroyListing)); //delete route     
 
//  //show route
//  router.get("/:id",wrapAsync (listingController.showListing));
//  //update route
//    router.put("/:id",isLoggedIn,isOwner,validateListing,wrapAsync(listingController.updateListing));
//  //delete route
//  router.delete("/:id",isLoggedIn,isOwner,wrapAsync(listingController.destroyListing));

 //edit route
 router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.renderEditForm));

 module.exports = router;