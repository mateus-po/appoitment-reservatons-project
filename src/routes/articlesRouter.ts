var express = require('express')
var router = express.Router();

router.get('/', function(req:any, res:any, next:any) {
    res.render("index");
  });

module.exports = router