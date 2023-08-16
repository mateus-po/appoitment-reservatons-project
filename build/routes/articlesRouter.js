"use strict";
var express = require('express');
var router = express.Router();
router.get('/', function (req, res, next) {
    res.render("index");
});
router.get('/error404', (req, res) => {
    res.render('404');
});
module.exports = router;
