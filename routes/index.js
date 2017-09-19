var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('res from fb',req);
  res.render('index', { title: 'Express' });
});
router.get('/success', function(req, res, next) {
  console.log('res from fb',req);
  res.render('index', { title: 'Success' });
});

module.exports = router;
