var express = require('express')
var router = express.Router();

router.get('/login', function(req:any, res:any, next:any) {
    res.render("login");
  });
router.get('/signup', function(req:any, res:any, next:any) {
    res.render("signup");
  });

module.exports = router