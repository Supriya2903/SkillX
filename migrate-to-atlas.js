const mongoose = require('mongoose');

// ⚙️ CONFIGURATION
const LOCAL_URI = 'mongodb://127.0.0.1:27017/skillswap';
// 👇 YOUR ATLAS CONNECTION STRING
const ATLAS_URI = 'mongodb+srv://supriyashri290302_db_user:xxFTrlhFjaJhhsLA@skillswap.zwjd6e.mongodb.net/skillswap?retryWrites=true&w=majority&appName=SkillSwap';

// Simple schemas that work with any data structure
const UserSchema = new mongoose.Schema({}, { strict: false });
const SkillSchema = new mongoose.Schema({}, { strict: false });
const MessageSchema = new mongoose.Schema({}, { strict: false });
const NotificationSchema = new mongoose.Schema({}, { strict: false });

async function migrateToAtlas() {
  console.log('🚀 Starting migration from local MongoDB to Atlas...\n');

  // Check if Atlas URI is configured
  if (ATLAS_URI === 'PASTE_YOUR_ATLAS_CONNECTION_STRING_HERE') {
    console.error('❌ Please update the ATLAS_URI in this script with your actual Atlas connection string!');
    console.log('\n📋 Steps to get your Atlas connection string:');
    console.log('1. Go to MongoDB Atlas dashboard');
    console.log('2. Click "Connect" on your cluster');
    console.log('3. Choose "Connect your application"');
    console.log('4. Copy the connection string and replace ATLAS_URI in this file');
    return;
  }

  let localConnection, atlasConnection;

  try {
    // Connect to local MongoDB
    console.log('📡 Connecting to local MongoDB...');
    localConnection = await mongoose.createConnection(LOCAL_URI);
    console.log('✅ Connected to local MongoDB');

    // Connect to Atlas
    console.log('🌐 Connecting to MongoDB Atlas...');
    atlasConnection = await mongoose.createConnection(ATLAS_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Create models for both connections
    const LocalUser = localConnection.model('User', UserSchema);
    const LocalSkill = localConnection.model('Skill', SkillSchema);
    const LocalMessage = localConnection.model('Message', MessageSchema);
    const LocalNotification = localConnection.model('Notification', NotificationSchema);

    const AtlasUser = atlasConnection.model('User', UserSchema);
    const AtlasSkill = atlasConnection.model('Skill', SkillSchema);
    const AtlasMessage = atlasConnection.model('Message', MessageSchema);
    const AtlasNotification = atlasConnection.model('Notification', NotificationSchema);

    console.log('\n🔄 Starting data migration...');

    // Migrate Users
    console.log('👥 Migrating Users...');
    const users = await LocalUser.find({});
    if (users.length > 0) {
      // Clear existing users in Atlas (optional)
      await AtlasUser.deleteMany({});
      await AtlasUser.insertMany(users);
      console.log(`✅ Migrated ${users.length} users`);
      
      // Show sample user data
      const sampleUser = users[0];
      console.log(`   Sample: ${sampleUser.name || 'No name'} (${sampleUser.email || 'No email'})`);
    } else {
      console.log('   ℹ️ No users found');
    }

    // Migrate Skills
    console.log('🔧 Migrating Skills...');
    const skills = await LocalSkill.find({});
    if (skills.length > 0) {
      await AtlasSkill.deleteMany({});
      await AtlasSkill.insertMany(skills);
      console.log(`✅ Migrated ${skills.length} skills`);
    } else {
      console.log('   ℹ️ No skills found');
    }

    // Migrate Messages
    console.log('💬 Migrating Messages...');
    const messages = await LocalMessage.find({});
    if (messages.length > 0) {
      await AtlasMessage.deleteMany({});
      await AtlasMessage.insertMany(messages);
      console.log(`✅ Migrated ${messages.length} messages`);
    } else {
      console.log('   ℹ️ No messages found');
    }

    // Migrate Notifications
    console.log('🔔 Migrating Notifications...');
    const notifications = await LocalNotification.find({});
    if (notifications.length > 0) {
      await AtlasNotification.deleteMany({});
      await AtlasNotification.insertMany(notifications);
      console.log(`✅ Migrated ${notifications.length} notifications`);
    } else {
      console.log('   ℹ️ No notifications found');
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📝 Next Steps:');
    console.log('1. Update your .env.local file:');
    console.log(`   MONGODB_URI=${ATLAS_URI}`);
    console.log('2. Test your application locally');
    console.log('3. Deploy to Vercel with the new Atlas URI');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Local MongoDB connection failed. Make sure MongoDB is running.');
    }
    
    if (error.message.includes('Authentication failed')) {
      console.log('\n💡 Atlas authentication failed. Check your username and password in the connection string.');
    }
    
    if (error.message.includes('bad auth')) {
      console.log('\n💡 Invalid Atlas credentials. Make sure your database user is created correctly.');
    }

  } finally {
    // Close connections
    if (localConnection) await localConnection.close();
    if (atlasConnection) await atlasConnection.close();
    console.log('\n🔌 Connections closed');
  }
}

// Run the migration
migrateToAtlas();
