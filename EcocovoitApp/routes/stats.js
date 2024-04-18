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
                    const distanceInfo = response.data.rows[0].elements[0].distance.value; 
                    return distanceInfo / 1000; 
                }).catch(error => {
                    console.error('Error calling the Google Distance Matrix API for trip:', trip._id, error);
                    return 0; 
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


router.get('/api/stats/allSiteStats', async (req, res) => {
    try {
       
        const trips = await Trips.find().populate('vehicle');
        console.log(trips);
        const results = await Promise.all(trips.map(async trip => {
            const params = {
                origins: encodeURIComponent(trip.departureLocation),
                destinations: encodeURIComponent(trip.destinationLocation),
                mode: 'driving',
                key: process.env.GOOGLE_API_KEY,
                units: 'metric'
            };
            console.log(params);
            const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${params.origins}&destinations=${params.destinations}&mode=${params.mode}&key=${params.key}&units=${params.units}`;

            const response = await axios.get(url);
            const distanceInfo = response.data.rows[0].elements[0].distance.value;
            const emissionRate = trip.vehicle.emmission;
            const emissionInfo = ((distanceInfo / 1000) * emissionRate).toFixed(2);
            const emissionPerPassenger = emissionInfo / (trip.passengers.length+1);
            const baselineEmission = ((distanceInfo / 1000) * 120).toFixed(2);
            const co2Savings = (baselineEmission - emissionPerPassenger).toFixed(0);

            return { co2Savings: parseInt(co2Savings), distanceInfo };
        }));

        const totalCo2Savings = ((results.reduce((acc, curr) => acc + curr.co2Savings, 0))/1000).toFixed(2) + " Kg";
        const totalDistance = ((results.reduce((acc, curr) => acc + curr.distanceInfo, 0)) / 1000).toFixed(2) + " Km";
        const numberOfTrips = results.length + " Trips";

        const userCount = await User.countDocuments({}) + " Users";

        res.status(200).send({
            totalCo2Savings,
            totalDistance,
            numberOfTrips,
            userCount
        });

    } catch (error) {
        console.error('Error gathering site stats', error);
        res.status(500).send('Failed to retrieve site statistics');
    }
});


module.exports = router;