var express = require('express');
var app = express();
var sass = require('node-sass-middleware');

app.set('port', process.env.PORT || 3000);
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

app.listen(app.get('port'), function () {
  console.log('Example app listening on port ' + app.get('port'));
});
