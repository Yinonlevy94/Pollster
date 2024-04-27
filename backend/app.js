const express = require('express');
const mongoose = require('mongoose');
// const fs = require('fs'); // Import fs module for file operations

const app = express();
const PORT = process.env.PORT || 5000;
const cors = require('cors');
app.use(cors());

// Assuming User is a mongoose model defined elsewhere in your code
const User = require('./models/User'); // Import User model


mongoose.connect('mongodb+srv://shai34511:19971011aA@pollster.vtjbafr.mongodb.net/',
{ useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use(express.json()); // for parsing application/json
app.post('/api', async (req, res) => {
  console.log(req.body.username);
  console.log(req.body.password);
  try {
    // Construct JSON object with username and password
    const userData = {
      name: req.body.username,
      password: req.body.password
    };

    // Create a new User document using the User model and userData
    const newUser = new User(userData);

    // Save the new user to the database
    const savedUser = await newUser.save();
    
    // Send the savedUser object as the response
    res.status(201).json(savedUser);
  } catch (error) {
    // If an error occurs, send an error response and log the error
    res.status(400).json({ error: error.message });
    console.log('Error saving data to MongoDB:', error);
  }
});

app.get('/', (req, res) => res.send('hello world'));

app.post('/', (req, res) => {
  res.send('This is the POST response');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
