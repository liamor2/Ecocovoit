var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();
var User = require('../schemas').User
var Reward = require('../schemas').Reward
var bcrypt = require('bcryptjs');
const axios = require('axios');

var salt = bcrypt.genSaltSync(10);
router.use(express.json());

router.get('/api/users',(req,res) => {
  User.find({}).then(
    data => res.send(data)
  ).catch(
    err => { throw err; }
  );
});

router.get('/api/users/:id', (req, res) => {
  User.findById(req.params.id).then(user => {
    res.status(200).send(user);
  }).catch(err => {
    res.status(500).send('Error');
  });
});

router.get('/api/users/:id/points', (req, res) => {
  User.findById(req.params.id).then(user => {
    const points = user.points;
    res.status(200).send({points});
  }).catch(err => {
    res.status(500).send('Error');
  });
});


router.post('/api/users', (req, res) => {
  var user = new userSchema({
    email: req.body.email,
    password: bcrypt.hash(req.body.password, salt),
    username: req.body.username,
    address: req.body.address,
  });

  user.save().then(user => {
    res.status(200).send('User created');
  }).catch(err => {
    res.status(500).send('Error');
  });
});

router.put('/api/users/:id', (req, res) => {
  User.findByIdAndUpdate(req.params.id, req.body, { new: true }).then(user => {
    res.status(200).send('user updated');
  }).catch(err => {
    res.status(500).send('Error');
  });
});

router.delete('/api/users/:id', (req, res) => {
  User.findByIdAndDelete(req.params.id).then(user => {
    if(!user){
      res.status(404).send('user not found');
    }else{res.status(200).send('user deleted');}    
  }).catch(err => {
    res.status(500).send('Error');
  });
});

router.get('/api/users/:id/tripHistory', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate({
      path: 'trips',
      populate: { path: 'vehicle' }
    });

    const tripDetails = await Promise.all(user.trips.map(async trip => {
      const params = {
        origins: encodeURIComponent(trip.departureLocation),
        destinations: encodeURIComponent(trip.destinationLocation),
        mode: 'driving',
        key: process.env.GOOGLE_API_KEY,
        units: 'metric'
      };
      
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${params.origins}&destinations=${params.destinations}&mode=${params.mode}&key=${params.key}&units=${params.units}`;
      const response = await axios.get(url);

      const distanceInfo = response.data.rows[0].elements[0].distance.value;
      const emissionRate = trip.vehicle.emmission;
      const emissionInfo = ((distanceInfo / 1000) * emissionRate).toFixed(2);

      return {
        id: trip._id,
        vehicle: trip.vehicle,
        emission: emissionInfo,
        distance: distanceInfo,
        startLocation: trip.departureLocation,
        startTime: trip.departureTime
      };
    }));

    res.status(200).send(tripDetails);
  } catch (err) {
    console.error('Error retrieving trip history', err);
    res.status(500).send('Error retrieving trip history');
  }
});


router.get('/api/users/:id/redeemGift/:giftID', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const reward = await Reward.findById(req.params.giftID);

    if (user.points >= reward.points) {
      user.points -= reward.points; 
      user.redeemedRewards.push(req.params.giftID);

      await user.save();
      res.status(200).send('Reward redeemed');
    } else {
      res.status(403).send('Not enough points');
    }
  } catch (err) {
    res.status(500).send('Error');
  }
});

router.post('/api/login', (req, res) => {
  User.findOne({email: req.body.email}).then(user => {
    if(user && bcrypt.compareSync(req.body.password, user.password)){
      const token = jwt.sign({user}, process.env.SECRET_KEY);
      res.status(200).send({token});
    }else{
      res.status(401).send('Wrong password');
    }
  }).catch(err => {
    res.status(500).send('Error');
  });
});

router.post('/api/signup', (req, res) => {
  var user = new User({
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, salt),
    username: req.body.username,
    address: req.body.address,
    points: 0
  });

  user.save().then(user => {
    const token = jwt.sign({user}, process.env.SECRET_KEY);
    res.status(200).send({token});
  }).catch(() => {
    res.status(500).send('Error');
  });
});

router.get('/api/logout', (req, res) => {
  res.status(200).send('Logged out');
});


module.exports = router;

/**
 * @swagger
 * tags:
 *  name: Users
 *  description: User management
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: All users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Error
 * 
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: The user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       500:
 *         description: Error
 * 
 * /api/users/{id}:
 *   get:
 *     summary: Get a user by its ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       500:
 *         description: Error
 * 
 *   put:
 *     summary: Update a user by its ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: The user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       500:
 *         description: Error
 * 
 *   delete:
 *     summary: Delete a user by its ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Error
 * 
 * /api/users/{id}/points:
 *   get:
 *     summary: Get user points by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User points
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 points:
 *                   type: number
 *       500:
 *         description: Error
 * 
 * /api/users/{id}/tripHistory:
 *   get:
 *     summary: Get user trip history by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User trip history
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   vehicle:
 *                     $ref: '#/components/schemas/Vehicle'
 *                   emission:
 *                     type: number
 *                   distance:
 *                     type: number
 *                   startLocation:
 *                     type: string
 *                   startTime:
 *                     type: string
 *       500:
 *         description: Error
 * 
 * /api/users/{id}/redeemGift/{giftID}:
 *   post:
 *     summary: Redeem a gift for a user by ID and gift ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user
 *         schema:
 *           type: string
 *       - in: path
 *         name: giftID
 *         required: true
 *         description: ID of the gift
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       403:
 *         description: Not enough points
 *       500:
 *         description: Error
 * 
 * /api/login:
 *   post:
 *     summary: User login
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       401:
 *         description: Wrong password
 *       500:
 *         description: Error
 * 
 * /api/signup:
 *   post:
 *     summary: User signup
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               username:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Signup successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       500:
 *         description: Error
 * 
 * /api/logout:
 *   get:
 *     summary: User logout
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Logged out
 *       500:
 *         description: Error
 */