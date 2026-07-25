const axios = require('axios');
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb://localhost:27017/url-shortener');
  
  // Inject a fresh user to get a token
  await mongoose.connection.db.collection('users').updateOne(
    { email: 'test_zod@example.com' },
    { $set: { apiKey: 'zod_test_key', password: 'abc' } },
    { upsert: true }
  );
  
  try {
    const res = await axios.post('http://localhost:5000/api/shorten', 
    { 
      longUrl: "https://youtu.be/f8u6ri0K3Qk?si=R3fQlRWsScDvcj0Y"
    }, 
    {
      headers: { 'x-api-key': 'zod_test_key', 'Content-Type': 'application/json' }
    });
    console.log("Success:", res.data);
  } catch (e) {
    console.error("Failed:", e.response?.data || e.message);
  }
  
  process.exit(0);
}
run();
