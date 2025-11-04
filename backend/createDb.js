require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to database:', process.env.MONGODB_URI))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Define a simple schema
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String
});

// Create model
const User = mongoose.model('User', userSchema);

// Insert a sample document to create the database
const sampleUser = new User({
  username: 'admin',
  email: 'admin@example.com',
  password: '123456'
});

sampleUser.save()
  .then(() => {
    console.log('User added, database created successfully!');
    mongoose.connection.close();
  })
  .catch(err => console.error(err));
