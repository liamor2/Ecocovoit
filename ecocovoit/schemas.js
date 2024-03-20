const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
    departureLocation: String,
    departureTime: Date,
    destinationLocation: String,
    destinationTime: Date,
    date: Date,
    seats: Number,
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    passengers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
    });

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    points: Number,
    trips: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trip'
    }]
});

module.exports = {
    Trip: mongoose.model('Trip', tripSchema),
    User: mongoose.model('User', userSchema)
};