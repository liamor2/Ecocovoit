var express = require('express');
var router = express.Router();
var Trips = require('../schemas').Trip
var Vehicle = require('../schemas').Vehicle
var User = require('../schemas').User
var Rewards = require('../schemas').Reward
const dotenv = require('dotenv');
const axios = require('axios');
const e = require('express');

dotenv.config();



router.use(express.json());

router.get('/api/stats', async (req, res) => {
    let trips = await Trips.find({}).populate('driver').populate('vehicle');
    let vehicles = await Vehicle.find({}).populate('owner');
    let users = await User.find({});
    let rewards = await Rewards.find({});

    let stats = {
        trips: trips,
        vehicles: vehicles,
        users: users.data,
        rewards: rewards.data
    }

    res.send(stats);
});


router.get('/api/stats/total-distance', (req, res) => {
    Trips.find({})
        .then(trips => {
            const promises = trips.map(trip => {
                const params = {
                    origins: encodeURIComponent(trip.departureLocation),
                    destinations: encodeURIComponent(trip.destinationLocation),
                    mode: 'driving',
                    key: process.env.GOOGLE_API_KEY,
                    units: 'metric'
                };
                const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${params.origins}&destinations=${params.destinations}&mode=${params.mode}&key=${params.key}&units=${params.units}`;

                return axios.get(url).then(response => {
                    const distanceInfo = response.data.rows[0].elements[0].distance.value; // Distance in meters
                    return distanceInfo / 1000; // Convert to km and return
                }).catch(error => {
                    console.error('Error calling the Google Distance Matrix API for trip:', trip._id, error);
                    return 0; // Return 0 distance in case of error
                });
            });

            Promise.all(promises).then(distances => {
                const totalDistance = distances.reduce((sum, distance) => sum + distance, 0);
                const amountTrip = distances.length;
                res.status(200).send({
                    totalDistance: totalDistance,
                    amountTrip: amountTrip

                });
            });
        })
        .catch(err => {
            console.error('Error finding trips', err);
            res.status(500).send('Error retrieving trip details');
        });
});


router.get('/api/stats/total-co2savings', (req, res) => {
    Trips.find().populate('vehicle')
      .then(trips => {
        Promise.all(trips.map(trip => {
          const params = {
            origins: encodeURIComponent(trip.departureLocation),
            destinations: encodeURIComponent(trip.destinationLocation),
            mode: 'driving',
            key: process.env.GOOGLE_API_KEY,
            units: 'metric'
          };
  
          const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${params.origins}&destinations=${params.destinations}&mode=${params.mode}&key=${params.key}&units=${params.units}`;
  
          return axios.get(url)
            .then(response => {
              const distanceInfo = response.data.rows[0].elements[0].distance.value;
              const emissionRate = trip.vehicle.emmission;
              const emissionInfo = ((distanceInfo / 1000) * emissionRate).toFixed(2);
              const emissionPerPassenger = emissionInfo / trip.seats;
  
              const baselineEmission = ((distanceInfo / 1000) * 150).toFixed(2);
              const co2Savings = (baselineEmission - emissionPerPassenger).toFixed(0);
  
              return parseInt(co2Savings); // Convert to integer for sum calculation
            });
        }))
        .then(results => {
          const totalCo2Savings = results.reduce((acc, savings) => acc + savings, 0); // Summing up all CO2 savings
          res.status(200).send({ totalCo2Savings }); // Send the total CO2 savings as an object
        })
        .catch(error => {
          console.error('Error calling the Google Distance Matrix API', error);
          res.status(500).send('Failed to retrieve distance information for one or more trips');
        });
      })
      .catch(err => {
        console.error('Error finding trips', err);
        res.status(500).send('Error retrieving trip details');
      });
  });
  
module.exports = router;


module.exports = router;
