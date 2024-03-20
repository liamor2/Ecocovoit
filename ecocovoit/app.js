const express = require('express');
const app = express();
const port = 3001;
const { MongoClient } = require('mongodb');
const uri = "mongodb://localhost:27017/cities_app";
const client = new MongoClient(uri, { useNewUrlParser: true });
const db = client.db("cities_app");
const mongoose = require('mongoose');


app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));



mongoose.connect('mongodb://localhost:27017/cities_app').then(() => console.log('Connecté avec succès à MongoDB')).catch((err) => console.error('Erreur lors de la connexion à MongoDB :', err));

const City = mongoose.model('City', { name: String, uuid: String });

// Démarrage du serveur

app.listen(port, () => {
  console.log(`Exemple d'application écoutant sur http://localhost:${port}`);
});

app.get('/', (req, res) => {
  res.render('index');
}
);

