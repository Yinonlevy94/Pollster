const mongoose = require('mongoose');
const readline = require('readline');

// Define the schema for the governmental user
const governmentUserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  id: {
    type: String,
    required: true,
    unique: true
  },
  isAssigned: {
    type: Boolean,
    default: false
  }
});

// Create the model for the governmental user
const GovernmentUser = mongoose.model('GovernmentUser', governmentUserSchema);

// Function to register a new governmental user
async function registerGovernmentUser(name, lastName, id) {
  // Connect to the MongoDB database
  await mongoose.connect('mongodb+srv://shaiyinonnaor:Z1QNFVMxZpfERxV4@governmentaldb.laueuty.mongodb.net/', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  try {
    // Create a new governmental user
    const newUser = new GovernmentUser({ name, lastName, id });

    // Save the new user to the database
    await newUser.save();

    console.log('User registered successfully:', newUser);
  } catch (error) {
    if (error.code === 11000) {
      console.error('Error: A user with this ID already exists');
    } else {
      console.error('Error registering user:', error);
    }
  } finally {
    // Close the connection to the database
    await mongoose.connection.close();
  }
}

// Function to ask for user input
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}

// Function to validate ID
function validateId(id) {
  const idPattern = /^\d{9}$/;
  return idPattern.test(id);
}

// Main function to prompt user for details and register the user
async function main() {
  const name = await askQuestion('Enter name: ');
  const lastName = await askQuestion('Enter last name: ');

  let id;
  while (true) {
    id = await askQuestion('Enter ID (exactly 9 digits, no letters or symbols): ');
    if (validateId(id)) {
      break;
    } else {
      console.log('Invalid ID. Please enter exactly 9 digits with no letters or symbols.');
    }
  }

  await registerGovernmentUser(name, lastName, id);
}

main().then(() => console.log('Script completed')).catch(err => console.error('Script error:', err));
