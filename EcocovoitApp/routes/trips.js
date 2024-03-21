var express = require('express');
var router = express.Router();
var Trips = require('../schemas').Trip

router.use(express.json());

router.get('/api/trips', (req, res) => {
  Trips.find({}).then(
    data => res.send(data)
  ).catch(
    err => { throw err; }
  );
});

router.get('/api/trips/:id', (req, res) => {
  Trips.findById(req.params.id).then(trip => {
    res.status(200).send(trip);
  }).catch(err => {
    res.status(500).send('Error');
  });
});

router.post('/api/trips', (req, res) => {
  var trip = new Trips({
    departureLocation: req.body.departureLocation,
    departureTime: req.body.departureTime,
    destinationLocation: req.body.destinationLocation,
    destinationTime: req.body.destinationTime,
    date: req.body.date,
    seats: req.body.seats,
    done: req.body.done,
    driver: req.body.driver,
    passengers: req.body.passengers,
    vehicle: req.body.vehicle
  });

  trip.save().then(trip => {
    res.status(200).send(trip);
  }).catch(err => {
    res.status(500).send('Error');
  });
});

router.put('/api/trips/:id', (req, res) => {
  Trips.findByIdAndUpdate
    (req.params.id, req.body, { new: true }).then(trip => {
      res.status(200).send(trip);
    }).catch(err => {
      res.status(500).send('Error');
    });
});

router.delete('/api/trips/:id', (req, res) => {
  Trips.findByIdAndDelete(req.params.id).then(trip => {
    if (!trip) {
      res.status(404).send('trip not found');
    } else { res.status(200).send('trip deleted'); }
  }).catch(err => {
    res.status(500).send('Error');
  });
});

module.exports = router;