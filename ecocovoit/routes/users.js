var express = require('express');
var router = express.Router();
var userSchema = require('../schemas').User

router.get('/api/users', function(req, res, next) {
  userSchema.find({}, function(err, users) {
    if (err) {
      res.status(500).send('Error');
    } else {
      res.status(200).send(users);
    }
  });
});

router.get('/api/users/:id', function(req, res, next) {
  userSchema.findById(req.params.id, function(err, user) {
    if (err) {
      res.status(500).send('Error');
    } else {
      res.status(200).send(user);
    }
  });
});

router.post('/api/users', function(req, res, next) {
  var user = new userSchema(req.body);
  user.save(function(err, user) {
    if (err) {
      res.status(500).send('Error');
    } else {
      res.status(200).send(user);
    }
  });
});

router.put('/api/users/:id', function(req, res, next) {
  userSchema.findByIdAndUpdate(req.params.id, req.body, function(err, user) {
    if (err) {
      res.status(500).send('Error');
    } else {
      res.status(200).send(user);
    }
  });
});

router.delete('/api/users/:id', function(req, res, next) {
  userSchema.findByIdAndRemove(req.params.id, function(err, user) {
    if (err) {
      res.status(500).send('Error');
    } else {
      res.status(200).send(user);
    }
  });
});

module.exports = router;