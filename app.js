var express = require('express');
var app = express();
var sass = require('node-sass-middleware');

app.use(require('./routes/index'));

app.use(sass({
    /* Options */
    src: './public/sass',
    dest: './public/stylesheets',
    debug: true,
    indentedSyntax: true,
    outputStyle: 'compressed',
    prefix:  '/stylesheets'
}));

app.use(express.static('./public'));
app.set('view engine', 'ejs');
app.set('views', './views');
app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
