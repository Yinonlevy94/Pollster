const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json()); // for parsing application/json

// Assuming User is a mongoose model defined elsewhere in your code
const User = require('./models/User'); // Import User model

mongoose.connect('mongodb+srv://shaiYinon:shaiYinon@pollster.rmi7ajf.mongodb.net/',
{ useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

  app.post('/api', async (req, res) => {
    console.log(req.body.username);
    console.log(req.body.password);
    try {
      const user = await User.findOne({
        name: req.body.username,
        password: req.body.password
      });
  
      if (user) {
        res.json({ redirectUrl: '/api/votepage' }); 
      } else {
        res.status(404).json({ error: 'User does not exist' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
      console.log('Error checking user in MongoDB:', error);
    }
  });
  

app.get('/', (req, res) => res.send('positive'));

app.post('/', (req, res) => {
  res.send('logging in');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
