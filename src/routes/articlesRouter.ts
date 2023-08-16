var express = require('express')
var router = express.Router();

router.get('/', function(req:any, res:any, next:any) {
    res.render("index");
  });

router.get('/error404', (req:any, res:any) => {
  res.render('404');
})

module.exports = router