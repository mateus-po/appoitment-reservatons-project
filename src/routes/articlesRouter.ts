var express = require('express')
const router = express.Router();

router.get('/', function(req:any, res:any, next:any) {
    res.render("index");
  });

module.exports = router