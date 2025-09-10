const mongoose = require('mongoose');

// Simple schema definitions
const UserSchema = new mongoose.Schema({}, { strict: false });
const SkillSchema = new mongoose.Schema({}, { strict: false });
const MessageSchema = new mongoose.Schema({}, { strict: false });
const NotificationSchema = new mongoose.Schema({}, { strict: false });

async function checkDatabase() {
  console.log('🔍 Checking local database...');
  
  try {
    // Connect to local MongoDB
    await mongoose.connect('mongodb://127.0.0.1:27017/skillswap');
    console.log('✅ Connected to local MongoDB');

    // Get collections
    const User = mongoose.model('User', UserSchema);
    const users = await User.find({});
    console.log(`👥 Found ${users.length} users`);
    
    if (users.length > 0) {
      console.log('Sample user:', users[0].name || users[0].email || 'No name/email');
    }

    await mongoose.disconnect();
    
    return users.length > 0;

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Local MongoDB is not running. This means either:');
      console.log('   1. You don\'t have MongoDB installed locally');
      console.log('   2. MongoDB service is not started');
      console.log('   3. You haven\'t created any local data yet');
      console.log('\n✅ No problem! You can start fresh with Atlas.');
    }
    
    return false;
  }
}

checkDatabase();
