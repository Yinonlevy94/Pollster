const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect('your-mongodb-connection-string', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use(express.json()); // for parsing application/json

app.get('/', (req, res) => res.send('Hello World!'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
