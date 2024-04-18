const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const { User, Trip, Vehicle, Reward } = require('./schemas');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI).then(() => console.log('Connecté avec succès à MongoDB')).catch((err) => console.error('Erreur lors de la connexion à MongoDB :', err));

var salt = bcrypt.genSaltSync(10);

async function createExampleData() {

  // Create example users
  const users = await User.insertMany([
    { username: 'John Shepard', email: 'john.shepard@gmail.com', address: '123 Main St, City A', password: await bcrypt.hash('password1', salt), points: 0, role: 1 },
    { username: 'Jane Shepard', email: 'jane.shepard@gmail.com', address: '456 Elm St, City B', password: await bcrypt.hash('password2', salt), points: 0, role: 0 },
    { username: 'Alex Smith', email: 'alex.smith@gmail.com', address: '789 Oak St, City C', password: await bcrypt.hash('password3', salt), points: 0, role: 0 }
  ]);

  // Create example trips with references to the created users
  const trips = await Trip.insertMany([
    {
      departureLocation: "18 Rue de la République 69002 Lyon",
      departureTime: new Date("2024-04-15T07:00:00Z"),
      destinationLocation: "15 Av Jean Médecin 06000 Nice",
      destinationTime: new Date("2024-04-15T09:00:00Z"),
      date: new Date("2024-04-15"),
      seats: 3,
      driver: users[0]._id, // Assuming first user is the driver
      passengers: [users[1]._id], // Assuming second user is a passenger
      vehicle: vehicles[0]._id // Assuming first vehicle is used
    },
    {
      departureLocation: "47 Bd de Sébastopol 75001 Paris",
      departureTime: new Date("2024-04-20T10:00:00Z"),
      destinationLocation: "54 Av de la République 44600 Saint-Nazaire",
      destinationTime: new Date("2024-04-20T12:30:00Z"),
      date: new Date("2024-04-20"),
      seats: 2,
      driver: users[1]._id, // Assuming second user is the driver now
      passengers: [users[2]._id] // Assuming third user is a passenger
    }
  ]);

  const vehicles = await Vehicle.insertMany([
    {
      name: 'Average Car',
      seats: 4,
      options: ['Air conditioning'],
      emmission: 150,
      owner: users[0]._id
    },
    {
      name: 'Light Car',
      seats: 2,
      emmission: 100,
      options: ['Heated seats'],
      owner: users[1]._id
    },
    {
      name: 'Large Car',
      seats: 6,
      emmission: 200,
      options: ['Air conditioning', 'Heated seats'],
      owner: users[1]._id
    }
  ]);



  // Update users with their trips
  await Promise.all(users.map(async (user, index) => {
    user.trips = trips.filter(trip => trip.driver.toString() === user._id.toString()).map(trip => trip._id);
    await user.save();
  }));

  // Update users with their vehicles
  await Promise.all(users.map(async (user, index) => {
    user.vehicles = vehicles.filter(vehicle => vehicle.owner.toString() === user._id.toString()).map(vehicle => vehicle._id);
    await user.save();
  }));

  // Update vehicles with their owner
  await Promise.all(vehicles.map(async (vehicle, index) => {
    vehicle.owner = users.find(user => user._id.toString() === vehicle.owner.toString())._id;
    await vehicle.save();
  }));

  // Update trips with their driver and passengers
  await Promise.all(trips.map(async (trip, index) => {
    trip.driver = users.find(user => user._id.toString() === trip.driver.toString())._id;
    trip.passengers = trip.passengers.map(passenger => users.find(user => user._id.toString() === passenger.toString())._id);
    await trip.save();
  }));

  const rewards = await Reward.insertMany([
    {
      name: 'Café',
      points: 1000,
      description: 'Venez prendre un café chez nos stations essences partenaires, c\'est nous qui payons!'
    },
    {
      name: 'RéductionPneus',
      points: 2000,
      description: '20% de réduction sur votre prochain changement de pneus'
    },
    {
      name: '50kmOffert',
      points: 50000,
      description: '50km de covoiturage offert pour votre prochain trajet'
    }
  ]);



  console.log('Example data has been added to the ecocovoit database.');
}

createExampleData().then(() => {
  console.log('Finished populating database.');
  mongoose.connection.close();
}).catch(err => {
  console.error('An error occurred:', err);
  mongoose.connection.close();
});
