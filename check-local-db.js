const mongoose = require('mongoose');

// Local MongoDB connection
const LOCAL_URI = 'mongodb://127.0.0.1:27017/skillswap';

// Import your models
const Users = require('./src/models/Users');
const Skills = require('./src/models/Skill');
const Messages = require('./src/models/Message');
const Notifications = require('./src/models/Notification');

async function checkLocalDatabase() {
  console.log('🔍 Checking local database contents...');
  
  try {
    // Connect to local database
    await mongoose.connect(LOCAL_URI);
    console.log('✅ Connected to local MongoDB');

    // Check Users
    const userCount = await Users.countDocuments();
    console.log(`👥 Users: ${userCount}`);
    
    if (userCount > 0) {
      const sampleUser = await Users.findOne();
      console.log('Sample user:', {
        name: sampleUser.name,
        email: sampleUser.email,
        skillsOffered: sampleUser.skillsOffered?.length || 0,
        skillsNeeded: sampleUser.skillsNeeded?.length || 0
      });
    }

    // Check Skills
    const skillsCount = await Skills.countDocuments();
    console.log(`🔧 Skills: ${skillsCount}`);

    // Check Messages
    const messagesCount = await Messages.countDocuments();
    console.log(`💬 Messages: ${messagesCount}`);

    // Check Notifications
    const notificationsCount = await Notifications.countDocuments();
    console.log(`🔔 Notifications: ${notificationsCount}`);

    // Close connection
    await mongoose.disconnect();
    
    console.log('\n📊 Summary:');
    console.log(`Total Users: ${userCount}`);
    console.log(`Total Skills: ${skillsCount}`);
    console.log(`Total Messages: ${messagesCount}`);
    console.log(`Total Notifications: ${notificationsCount}`);

    if (userCount === 0 && skillsCount === 0 && messagesCount === 0 && notificationsCount === 0) {
      console.log('\n ℹ️ Your local database appears to be empty. No migration needed!');
      console.log('You can proceed directly to update your .env.local file and deploy.');
    } else {
      console.log('\n✅ Found data to migrate! Proceed with the migration script after getting your Atlas connection string.');
    }

  } catch (error) {
    console.error('❌ Error checking local database:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n🔴 Local MongoDB is not running or not accessible.');
      console.log('If you don\'t have any important data locally, you can skip migration and start fresh with Atlas.');
    }
  }
}

// Run the check
checkLocalDatabase();
