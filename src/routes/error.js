import express from 'express';
const router = express.Router();

module.exports = () => {
  router.get('*', function(req, res, next) {
    var err = new Error();
    err.status = 404;
    next(err);
  });

  // handling 404 errors
  router.use(function(err, req, res, next) {
    if(err.status !== 404) {
      return next();
    }

    res.status(404).send("<h1> 404 </h1> <h3>Unauthorized access</h3>");
  });
}
