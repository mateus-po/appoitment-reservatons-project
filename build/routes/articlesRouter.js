"use strict";
var express = require('express');
const router = express.Router();
router.get('/', function (req, res, next) {
    res.render("index");
});
module.exports = router;
