var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var imageList = fs.readdirSync(path.join(__dirname, '../public/images'));

router.get('/', function (req, res) {
  res.render('index', {
      images: imageList
  });
});

module.exports = router;
