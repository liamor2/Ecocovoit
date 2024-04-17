<template>
    <div>
      <div class="tripComponent" v-for="trip in trips" :key="trip._id">
        <h2>Trip Information</h2>
        <p><strong>Departure Location:</strong> {{ trip.departureLocation }}</p>
        <p><strong>Departure Time:</strong> {{ trip.departureTime }}</p>
        <p><strong>Destination Location:</strong> {{ trip.destinationLocation }}</p>
        <p><strong>Destination Time:</strong> {{ trip.destinationTime }}</p>
        <p><strong>Date:</strong> {{ trip.date }}</p>
        <p><strong>Seats:</strong> {{ trip.seats }}</p>
        <p><strong>Driver:</strong> {{ trip.driver }}</p>
        <p><strong>Passengers:</strong> {{ trip.passengers }}</p>
        <p><strong>Vehicle:</strong> {{ trip.vehicle }}</p>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    name: 'TripComponent',
    data() {
      return {
        trips: [] // This will hold an array of trip objects
      }
    },
    mounted() {
      this.fetchTrips();
    },
    methods: {
      fetchTrips() {
        axios.get('http://localhost:3001/api/trips')
          .then(response => {
            this.trips = response.data; // Assume the response is an array of trip objects
          })
          .catch(error => {
            console.error("There was an error fetching the trips:", error);
          });
      }
    }
  }
  </script>