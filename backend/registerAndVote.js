const mongoose = require('mongoose');
const axios = require('axios');
const { faker } = require('@faker-js/faker');

const govDbUrl = 'mongodb+srv://shaiyinonnaor:Z1QNFVMxZpfERxV4@governmentaldb.laueuty.mongodb.net/';

const platformUrl = 'http://localhost:5000/api';

const users = Array.from({ length: 70 }).map(() => ({
  name: faker.name.firstName(),
  lastName: faker.name.lastName(),
  id: faker.datatype.number({ min: 100000000, max: 999999999 }).toString()
}));

const candidates = ['Benny Gantz', 'Bibi Netanyahu', 'Naftali Bennet'];

const governmentUserSchema = new mongoose.Schema({
  name: String,
  lastName: String,
  id: String,
  isAssigned: Boolean
});

const GovernmentUser = mongoose.model('GovernmentUser', governmentUserSchema);

async function registerGovernmentUser(user) {
  try {
    const govUser = new GovernmentUser({ ...user, isAssigned: false });
    await govUser.save();
    console.log(`Government user ${user.name} ${user.lastName} registered with ID ${user.id}`);
  } catch (error) {
    console.error('Error registering government user:', error);
  }
}

async function signUpUser(user) {
  try {
    const response = await axios.post(`${platformUrl}/register`, {
      username: `${user.name}_${user.lastName}`,
      password: 'password123',
      id: user.id
    });

    if (response.status === 201) {
      console.log(`User ${user.name} ${user.lastName} signed up successfully`);
      return true;
    }
  } catch (error) {
    console.error('Error signing up user:', error);
  }
  return false;
}

async function voteUser(user, candidate) {
  try {
    const loginResponse = await axios.post(platformUrl, {
      username: `${user.name}_${user.lastName}`,
      password: 'password123'
    });

    if (loginResponse.status === 200 && loginResponse.data.redirectUrl === '/vote') {
      const voteResponse = await axios.post(`${platformUrl}/votepage`, {
        username: `${user.name}_${user.lastName}`,
        vote: candidate
      });

      if (voteResponse.status === 200) {
        console.log(`User ${user.name} ${user.lastName} voted for ${candidate}`);
        return true;
      }
    }
  } catch (error) {
    console.error('Error voting:', error);
  }
  return false;
}

async function main() {
  await mongoose.connect(govDbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  for (const user of users) {
    await registerGovernmentUser(user);

    const isSignedUp = await signUpUser(user);
    if (isSignedUp) {
      const candidate = candidates[Math.floor(Math.random() * candidates.length)];
      await voteUser(user, candidate);
    }
  }

  mongoose.connection.close();
}

main().then(() => console.log('Script completed')).catch(err => console.error('Script error:', err));
