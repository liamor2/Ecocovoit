var express = require('express');
var router = express.Router();
var userSchema = require('../schemas').User

router.get('/api/trips', function(req, res, next) {
  userSchema.find({}, function(err, users) {
    if (err) {
      res.status(500).send('Error');
    } else {
      res.status(200).send(users);
    }
  });
});

module.exports = router;