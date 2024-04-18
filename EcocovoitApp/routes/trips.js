var express = require('express');
var router = express.Router();
var Trips = require('../schemas').Trip
var Vehicle = require('../schemas').Vehicle
var User = require('../schemas').User
const dotenv = require('dotenv');
const axios = require('axios');
const e = require('express');

dotenv.config();



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

router.get('/api/trips/details/:id', (req, res) => {
  Trips.findById(req.params.id)
    .populate('vehicle')
    .then(trip => {
      console.log('trip', trip);
      console.log('vehicle', trip.vehicle);
      console.log('emisison', trip.vehicle.emission);
      const params = {
        origins: encodeURIComponent(trip.departureLocation),
        destinations: encodeURIComponent(trip.destinationLocation),
        mode: 'driving',
        key: process.env.GOOGLE_API_KEY,
        units: 'metric'
      };

      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${params.origins}&destinations=${params.destinations}&mode=${params.mode}&key=${params.key}&units=${params.units}`;

      axios.get(url)
        .then(response => {
          const distanceInfo = response.data.rows[0].elements[0].distance.value;
          const emissionRate = trip.vehicle.emmission;
          const emissionInfo = ((distanceInfo / 1000) * emissionRate).toFixed(2);

          res.status(200).send({
            distance: distanceInfo,
            emission: emissionInfo,
            startLocation: trip.departureLocation,
            startTime: trip.departureTime,
          });
        })
        .catch(error => {
          console.error('Error calling the Google Distance Matrix API', error);
          res.status(500).send('Failed to retrieve distance information');
        });
    })
    .catch(err => {
      console.error('Error finding trip', err);
      res.status(500).send('Error retrieving trip details');
    });
});


router.get('/api/trips/baselineEmission/:id', (req, res) => {
  Trips.findById(req.params.id)
    .then(trip => {
      console.log('trip', trip);
      console.log('vehicle', trip.vehicle);
      console.log('emisison', trip.vehicle.emission);
      const params = {
        origins: encodeURIComponent(trip.departureLocation),
        destinations: encodeURIComponent(trip.destinationLocation),
        mode: 'driving',
        key: process.env.GOOGLE_API_KEY,
        units: 'metric'
      };

      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${params.origins}&destinations=${params.destinations}&mode=${params.mode}&key=${params.key}&units=${params.units}`;

      axios.get(url)
        .then(response => {
          const distanceInfo = response.data.rows[0].elements[0].distance.value;
          const emissionRate = 200;
          const emissionInfo = ((distanceInfo / 1000) * emissionRate).toFixed(2);
          res.status(200).send({
            emission: emissionInfo,
          });
        })
        .catch(error => {
          console.error('Error calling the Google Distance Matrix API', error);
          res.status(500).send('Failed to retrieve distance information');
        });
    })
    .catch(err => {
      console.error('Error finding trip', err);
      res.status(500).send('Error retrieving trip details');
    });
});

router.get('/api/trips/co2savings/:id', (req, res) => {
  Trips.findById(req.params.id)
    .populate('vehicle')
    .then(trip => {
      console.log('trip', trip);
      console.log('vehicle', trip.vehicle);
      console.log('emission', trip.vehicle.emission);
      const params = {
        origins: encodeURIComponent(trip.departureLocation),
        destinations: encodeURIComponent(trip.destinationLocation),
        mode: 'driving',
        key: process.env.GOOGLE_API_KEY,
        units: 'metric'
      };

      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${params.origins}&destinations=${params.destinations}&mode=${params.mode}&key=${params.key}&units=${params.units}`;

      axios.get(url)
        .then(response => {
          const distanceInfo = response.data.rows[0].elements[0].distance.value;
          const emissionRate = trip.vehicle.emmission;
          const emissionInfo = ((distanceInfo / 1000) * emissionRate).toFixed(2);
          const emissionPerPassenger = emissionInfo / trip.seats;

          const baselineEmission = ((distanceInfo / 1000) * 150).toFixed(2);
          const co2Savings = (baselineEmission - emissionPerPassenger).toFixed(0);

          const passengerPoints = Math.round(co2Savings);
          const driverPoints = Math.round((+co2Savings * 1.2) + (trip.seats - 1) * 0.1 * co2Savings);

          res.status(200).send({
            emission: emissionInfo,
            baselineEmission: baselineEmission,
            emissionPerPassenger: emissionPerPassenger,
            co2Savings: co2Savings,
            pointsPerPassenger: passengerPoints,
            pointsForDriver: driverPoints
          });
        })
        .catch(error => {
          console.error('Error calling the Google Distance Matrix API', error);
          res.status(500).send('Failed to retrieve distance information');
        });
    })
    .catch(err => {
      console.error('Error finding trip', err);
      res.status(500).send('Error retrieving trip details');
    });

});

router.get('/api/trips/calculateAndAddPoints/:id', (req, res) => {
  Trips.findById(req.params.id)
    .populate('vehicle')
    .populate('driver')
    .populate('passengers')
    .then(trip => {
      const params = {
        origins: encodeURIComponent(trip.departureLocation),
        destinations: encodeURIComponent(trip.destinationLocation),
        mode: 'driving',
        key: process.env.GOOGLE_API_KEY,
        units: 'metric'
      };

      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${params.origins}&destinations=${params.destinations}&mode=${params.mode}&key=${params.key}&units=${params.units}`;

      axios.get(url)
        .then(response => {
          const distanceInfo = response.data.rows[0].elements[0].distance.value;
          const emissionRate = trip.vehicle.emmission;
          const emissionInfo = ((distanceInfo / 1000) * emissionRate).toFixed(2);
          const emissionPerPassenger = emissionInfo / trip.seats;

          const baselineEmission = ((distanceInfo / 1000) * 150).toFixed(2);
          const co2Savings = (baselineEmission - emissionPerPassenger).toFixed(0);

          const passengerPoints = Math.round(co2Savings);
          const driverPoints = Math.round((+co2Savings * 1.2) + (trip.seats - 1) * 0.1 * co2Savings);
          console.log(trip.passengers)
          const updatePassengersPoints = trip.passengers.map(passenger => 
            User.findByIdAndUpdate(passenger._id, { $inc: { points: passengerPoints } }, { new: true })
          );
          const updateDriverPoints = User.findByIdAndUpdate(trip.driver._id, { $inc: { points: driverPoints } }, { new: true });

          Promise.all([...updatePassengersPoints, updateDriverPoints])
            .then(() => {
              res.status(200).send({
                emission: emissionInfo,
                baselineEmission: baselineEmission,
                emissionPerPassenger: emissionPerPassenger,
                co2Savings: co2Savings,
                pointsPerPassenger: passengerPoints,
                pointsForDriver: driverPoints
              });
            })
            .catch(error => {
              console.error('Error updating user points', error);
              res.status(500).send('Failed to update user points');
            });
        })
        .catch(error => {
          console.error('Error calling the Google Distance Matrix API', error);
          res.status(500).send('Failed to retrieve distance information');
        });
    })
    .catch(err => {
      console.error('Error finding trip', err);
      res.status(500).send('Error retrieving trip details');
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

router.put('/api/trips/addPassenger/:id', (req, res) => {
  Trips.findById(req.params.id)
    .then(trip => {
      if (trip.passengers.length < trip.availableSeats) {
        Trips.findByIdAndUpdate(req.params.id, { $push: { passengers: req.body.passenger } }, { new: true })
          .then(updatedTrip => {
            res.status(200).send(updatedTrip);
          })
          .catch(err => {
            res.status(500).send('Error updating trip');
          });
      } else {
        res.status(400).send('No available seats to add a new passenger');
      }
    })
    .catch(err => {
      res.status(500).send('Error finding trip');
    });
});

router.get('/api/trips/price/:id', (req, res) => {
  Trips.findById(req.params.id)
    .then(trip => {
      const params = {
        origins: encodeURIComponent(trip.departureLocation),
        destinations: encodeURIComponent(trip.destinationLocation),
        mode: 'driving',
        key: process.env.GOOGLE_API_KEY,
        units: 'metric'
      };

      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${params.origins}&destinations=${params.destinations}&mode=${params.mode}&key=${params.key}&units=${params.units}`;

      axios.get(url)
        .then(response => {
          const distanceInfo = response.data.rows[0].elements[0].distance.value;
          const averageFuelConsumption = 8; 
          const fuelPrice = 1.5; 
          const pricePerKm = (averageFuelConsumption / 100) * fuelPrice; 
          const priceInfo = ((distanceInfo / 1000) * pricePerKm).toFixed(2); 
          const pricePerPerson = (priceInfo / trip.seats).toFixed(2); 

          res.status(200).send({
            price: pricePerPerson,
          });
        })
        .catch(error => {
          console.error('Error calling the Google Distance Matrix API', error);
          res.status(500).send('Failed to retrieve distance information');
        });
    })
});


module.exports = router;

/**
 * @swagger
 * tags:
 *  name: Trips
 *  description: Trip management
 * 
 */

/**
 * @swagger
 * /api/trips:
 *   get:
 *     tags:
 *       - Trips
 *     description: Get all trips
 *     responses:
 *       '200':
 *         description: Successful operation
 *       '500':
 *         description: Error
 *   post:
 *     tags:
 *       - Trips
 *     description: Create a new trip
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Trip'
 *     responses:
 *       '200':
 *         description: Successful operation
 *       '500':
 *         description: Error
 *
 * /api/trips/{id}:
 *   get:
 *     tags:
 *       - Trips
 *     description: Get a trip by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the trip
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful operation
 *       '500':
 *         description: Error
 *   put:
 *     tags:
 *       - Trips
 *     description: Update a trip by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the trip
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Trip'
 *     responses:
 *       '200':
 *         description: Successful operation
 *       '500':
 *         description: Error
 *   delete:
 *     tags:
 *       - Trips
 *     description: Delete a trip by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the trip
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful operation
 *       '404':
 *         description: Trip not found
 *       '500':
 *         description: Error
 * 
* /api/trips/emission/{id}:
*   get:
*     tags:
*       - Trips
*     description: Get the emission of a trip by ID
*     parameters:
*       - name: id
*         in: path
*         description: ID of the trip
*         required: true
*         schema:
*           type: string
*     responses:
*       '200':
*         description: Successful operation
*       '500':
*         description: Error
*
* /api/trips/baselineEmission/{id}:
*   get:
*     tags:
*       - Trips
*     description: Get the emission of a baseline vehicle on a trip by ID
*     parameters:
*       - name: id
*         in: path
*         description: ID of the trip
*         required: true
*         schema:
*           type: string
*     responses:
*       '200':
*         description: Successful operation
*       '500':
*         description: Error
*
* /api/trips/co2savings/{id}:
*   get:
*     tags:
*       - Trips
*     description: Get the emission savings of a trip by ID (comparing emission divided by number of passengers to a baseline vehicle)
*     parameters:
*       - name: id
*         in: path
*         description: ID of the trip
*         required: true
*         schema:
*           type: string
*     responses:
*       '200':
*         description: Successful operation
*       '500':
*         description: Error
*
* /api/trips/addPassenger/:id:
*   put:
*     tags:
*       - Trips
*     description: Add a passenger to a trip by ID if available seats exist. Returns an error if no seats are available.
*     parameters:
*       - name: id
*         in: path
*         description: ID of the trip to which a passenger will be added
*         required: true
*         schema:
*           type: string
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               passenger:
*                 type: string
*                 description: ID of the passenger to add
*     responses:
*       '200':
*         description: Passenger added successfully and returns the updated trip
*       '400':
*         description: No available seats to add a new passenger
*       '500':
*         description: Error finding or updating trip
*
*
 */