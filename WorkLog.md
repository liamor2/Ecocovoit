# Work Log

## 2024-03-21

### Liam

- Modified the user collection according to the planned schema. The new schema is as follows:

  ```json
  {
    "username": "string",
    "email": "string",
    "address": {
      "street": "string",
      "city": "string",
      "zip": "string"
    },
    "password": "string",
    "points": "number",
    "role": "number",
    "Trips": [
      {
        <!-- link to the trip collection -->
      }
    ]
  }
  ```

- Added a vehicle collection to the database. The schema is as follows:

  ```json
  {
    "name": "string",
    "type": "string",
    "seats": "number",
    "options": ["string"],
    "owner": {
      <!-- link to the user collection -->
    }
  }
  ```

- Minor modification on the trip collection schema to include a done boolean field and the vehicle field. The new schema is as follows:

  ```json
  {
    "departureLocation": "string",
    "departureTime": "date",
    "destinationLocation": "string",
    "destinationTime": "date",
    "date": "date",
    "seats": "number",
    "done": "boolean",
    "driver": {
      <!-- link to the user collection -->
    },
    "passengers": [
      <!-- link to the user collection -->
    ],
    "vehicle": {
      <!-- link to the vehicle collection -->
    }
  }
  ```

- Created the work log file.
- Modified the db_init.js file to include the new changes in the schemas.
- Renamed the Ecocovoit folder to EcocovoitApp.
