"use strict";
var mongoose = require("mongoose");
const ImageModel = new mongoose.Schema({
    path: {
        type: String,
        required: [true, "image path is required"],
        unique: true
    },
    hasArticle: {
        type: Boolean,
        required: [true, "image hasArticle property is required"],
    },
    uploadTime: {
        type: Date,
        required: [true, "image upload time is required"]
    }
});
var Img = mongoose.model('image', ImageModel);
module.exports = Img;
