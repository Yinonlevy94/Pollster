const mongoose = require('mongoose');
const readline = require('readline');

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

const GovernmentUser = mongoose.model('GovernmentUser', governmentUserSchema);

async function registerGovernmentUser(name, lastName, id) {
  await mongoose.connect('mongodb+srv://shaiyinonnaor:Z1QNFVMxZpfERxV4@governmentaldb.laueuty.mongodb.net/', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  try {
    const newUser = new GovernmentUser({ name, lastName, id });

    await newUser.save();

    console.log('User registered successfully:', newUser);
  } catch (error) {
    if (error.code === 11000) {
      console.error('Error: A user with this ID already exists');
    } else {
      console.error('Error registering user:', error);
    }
  } finally {
    await mongoose.connection.close();
  }
}

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

function validateId(id) {
  const idPattern = /^\d{9}$/;
  return idPattern.test(id);
}

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
