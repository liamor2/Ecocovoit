const mongoose = require('mongoose');
const { Schema } = mongoose;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ecocovoit').then(() => console.log('Connecté avec succès à MongoDB')).catch((err) => console.error('Erreur lors de la connexion à MongoDB :', err));

// Define schemas
const userSchema = new Schema({
  email: String,
  password: String,
  points: Number,
  trips: [{
    type: Schema.Types.ObjectId,
    ref: 'Trip'
  }]
});

const tripSchema = new Schema({
  departureLocation: String,
  departureTime: Date,
  destinationLocation: String,
  destinationTime: Date,
  date: Date,
  seats: Number,
  driver: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  passengers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
});

// Create models
const User = mongoose.model('User', userSchema);
const Trip = mongoose.model('Trip', tripSchema);

// Create example users
async function createExampleData() {
  const users = await User.insertMany([
    { email: "john.doe@example.com", password: "hashed_password_here", points: 120 },
    { email: "jane.doe@example.com", password: "hashed_password_here", points: 150 },
    { email: "alex.smith@example.com", password: "hashed_password_here", points: 200 }
  ]);

  // Create example trips with references to the created users
  const trips = await Trip.insertMany([
    {
      departureLocation: "City A",
      departureTime: new Date("2024-04-15T07:00:00Z"),
      destinationLocation: "City B",
      destinationTime: new Date("2024-04-15T09:00:00Z"),
      date: new Date("2024-04-15"),
      seats: 3,
      driver: users[0]._id, // Assuming first user is the driver
      passengers: [users[1]._id] // Assuming second user is a passenger
    },
    {
      departureLocation: "City B",
      departureTime: new Date("2024-04-20T10:00:00Z"),
      destinationLocation: "City C",
      destinationTime: new Date("2024-04-20T12:30:00Z"),
      date: new Date("2024-04-20"),
      seats: 2,
      driver: users[1]._id, // Assuming second user is the driver now
      passengers: [users[2]._id] // Assuming third user is a passenger
    }
  ]);

  // Update users with their trips
  await Promise.all(users.map(async (user, index) => {
    user.trips = trips.filter(trip => trip.driver.toString() === user._id.toString()).map(trip => trip._id);
    await user.save();
  }));

  console.log('Example data has been added to the ecocovoit database.');
}

createExampleData().then(() => {
  console.log('Finished populating database.');
  mongoose.connection.close();
}).catch(err => {
  console.error('An error occurred:', err);
  mongoose.connection.close();
});
