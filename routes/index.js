var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
// Read image folder
var imageNames = [];
var imageList = fs.readdirSync(path.join(__dirname, '../public/images'));
// Add each file name to imageName
imageList.forEach(function(image, index){
    imageNames.push(image.substr(0, image.lastIndexOf('.')) || image); // remove extension
});

router.get('/', function (req, res) {
  res.render('index', {
      images: imageList,
      name: imageNames
  });
});

module.exports = router;
