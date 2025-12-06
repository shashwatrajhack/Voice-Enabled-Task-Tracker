// backend/scripts/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const Task = require('../src/models/Task');

const uriFromEnv = process.env.MONGO_URI;
console.log('Working directory:', process.cwd());
console.log('Loaded MONGO_URI from env:', !!uriFromEnv);

const uri = uriFromEnv || 'mongodb://localhost:27017/voice-task-tracker';

async function run() {
  try {
    console.log('Connecting to MongoDB URI:', uri.startsWith('mongodb+srv://') ? '(mongodb+srv) [redacted]' : uri);
    // Use recommended options
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // serverSelectionTimeoutMS: 10000, // optional: fail fast
    });
    console.log('MongoDB connected');

    // seed
    await Task.deleteMany({});
    await Task.create([
      { title: 'Finish README for voice-task', priority: 'High', status: 'To Do', dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) },
      { title: 'Refactor task model', priority: 'Medium', status: 'In Progress' },
      { title: 'Ship demo video', priority: 'Critical', status: 'To Do' },
    ]);
    console.log('Seed complete');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seed failed. Full error:');
    console.error(err);
    // Helpful extra info to paste if you need help:
    console.error('--- debugging info ---');
    console.error('MONGO_URI env value present:', !!process.env.MONGO_URI);
    if (process.env.MONGO_URI) {
      console.error('MONGO_URI (first 80 chars):', process.env.MONGO_URI.substring(0, 80));
    }
    process.exit(1);
  }
}

run();
