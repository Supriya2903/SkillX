const mongoose = require('mongoose');

// Local MongoDB connection
const LOCAL_URI = 'mongodb://127.0.0.1:27017/skillswap';

// Atlas MongoDB connection - You'll need to get this from MongoDB Atlas after completing setup
// Format: mongodb+srv://username:password@your-cluster-name.xxxxx.mongodb.net/skillswap?retryWrites=true&w=majority
const ATLAS_URI = 'mongodb+srv://supriyashri290302_db_user:xxFTrlhFjaJhhsLA@cluster0.xxxxx.mongodb.net/skillswap?retryWrites=true&w=majority';

// Import your models
const Users = require('./src/models/Users');
const Skills = require('./src/models/Skill');
const Messages = require('./src/models/Message');
const Notifications = require('./src/models/Notification');

async function migrateDatabase() {
  console.log('🚀 Starting database migration...');
  
  try {
    // Connect to local database
    console.log('📡 Connecting to local MongoDB...');
    const localConnection = await mongoose.createConnection(LOCAL_URI);
    console.log('✅ Connected to local MongoDB');

    // Connect to Atlas database
    console.log('🌐 Connecting to MongoDB Atlas...');
    const atlasConnection = await mongoose.createConnection(ATLAS_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Create models for both connections
    const LocalUsers = localConnection.model('Users', Users.schema);
    const LocalSkills = localConnection.model('Skills', Skills.schema);
    const LocalMessages = localConnection.model('Messages', Messages.schema);
    const LocalNotifications = localConnection.model('Notifications', Notifications.schema);

    const AtlasUsers = atlasConnection.model('Users', Users.schema);
    const AtlasSkills = atlasConnection.model('Skills', Skills.schema);
    const AtlasMessages = atlasConnection.model('Messages', Messages.schema);
    const AtlasNotifications = atlasConnection.model('Notifications', Notifications.schema);

    // Migrate Users
    console.log('👥 Migrating Users...');
    const users = await LocalUsers.find({});
    if (users.length > 0) {
      await AtlasUsers.insertMany(users);
      console.log(`✅ Migrated ${users.length} users`);
    } else {
      console.log('ℹ️ No users found to migrate');
    }

    // Migrate Skills
    console.log('🔧 Migrating Skills...');
    const skills = await LocalSkills.find({});
    if (skills.length > 0) {
      await AtlasSkills.insertMany(skills);
      console.log(`✅ Migrated ${skills.length} skills`);
    } else {
      console.log('ℹ️ No skills found to migrate');
    }

    // Migrate Messages
    console.log('💬 Migrating Messages...');
    const messages = await LocalMessages.find({});
    if (messages.length > 0) {
      await AtlasMessages.insertMany(messages);
      console.log(`✅ Migrated ${messages.length} messages`);
    } else {
      console.log('ℹ️ No messages found to migrate');
    }

    // Migrate Notifications
    console.log('🔔 Migrating Notifications...');
    const notifications = await LocalNotifications.find({});
    if (notifications.length > 0) {
      await AtlasNotifications.insertMany(notifications);
      console.log(`✅ Migrated ${notifications.length} notifications`);
    } else {
      console.log('ℹ️ No notifications found to migrate');
    }

    // Close connections
    await localConnection.close();
    await atlasConnection.close();

    console.log('🎉 Database migration completed successfully!');
    console.log('📝 Next steps:');
    console.log('1. Update your .env.local file with the new MongoDB Atlas URI');
    console.log('2. Test your application with the new database');
    console.log('3. Deploy to Vercel');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrateDatabase();
