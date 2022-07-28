const mongoose = require("mongoose");
const slugify = require("slugify");
const geocoder = require("../utils/geocoder");

const BookSchema = new mongoose.Schema({
  author: {
    type: String,
    required: [true, "Please add an author"],
    unique: true,
  },
  slug: String,
  rating: {
    type: Number,
    required: [true, "Please add a rating"],
  },
  description: {
    type: String,
    required: [true, "Please add a description"],
  },
  bookCost: Number,
  address: {
    type: String,
    required: [true, "Please add an address"],
  },
  photo: {
    type: String,
    default: "no-photo.jpg",
  },
  location: {
    //GeoJson Point
    type: {
      type: String,
      enum: ["Point"],
      // required: true,
    },
    coordinates: {
      type: [Number],
      // required: true,
      index: "2dsphere",
    },
    formattedAddress: String,
    street: String,
    city: String,
    state: String,
    zipcode: String,
    country: String,
  },
  averageCost: Number,
});

// Create a slug from name
BookSchema.pre("save", function (next) {
  this.slug = slugify(this.author, { lower: true });
  next();
});

// Geocoder
BookSchema.pre("save", async function (next) {
  const loc = await geocoder.geocode(this.address);
  this.location = {
    type: "Point",
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    city: loc[0].city,
    state: loc[0].stateCode,
    zipcode: loc[0].zipcode,
    country: loc[0].country,
    countryCode: loc[0].countryCode,
  };

  this.address = undefined;
  next();
});

module.exports = mongoose.model("Book", BookSchema);
