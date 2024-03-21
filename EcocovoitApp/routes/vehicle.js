var express = require('express');
var router = express.Router();
var Vehicle = require('../schemas').Vehicle

router.use(express.json());

router.get('/api/vehicles', (req, res) => {
    Vehicle.find({}).then(
        data => res.send(data)
    ).catch(
        err => { throw err; }
    );
});
    
router.get('/api/vehicles/:id', (req, res) => {
    Vehicle.findById(req.params.id).then(vehicle => {
        res.status(200).send(vehicle);
    }).catch(err => {
        res.status(500).send('Error');
    });
});

router.post('/api/vehicles', (req, res) => {
    var vehicle = new Vehicle({
        name: req.body.name,
        seats: req.body.seats,
        options: req.body.options,
        owner: req.body.owner
    });

    vehicle.save().then(vehicle => {
        res.status(200).send(vehicle);
    }).catch(err => {
        res.status(500).send('Error');
    });
});

router.put('/api/vehicles/:id', (req, res) => {
    Vehicle.findByIdAndUpdate
        (req.params.id, req.body, { new: true }).then(vehicle => {
            res.status(200).send(vehicle);
        }
    ).catch(err => {
        res.status(500).send('Error');
    }
    );
});

router.delete('/api/vehicles/:id', (req, res) => {
    Vehicle.findByIdAndDelete(req.params.id).then(vehicle => {
        if (!vehicle) {
            res.status(404).send('vehicle not found');
        } else { res.status(200).send('vehicle deleted'); }
    }).catch(err => {
        res.status(500).send('Error');
    });
});

module.exports = router;