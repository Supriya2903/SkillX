const mongoose = require('mongoose');

// Alternative connection strings to try
const connections = [
  // SRV format (original)
  'mongodb+srv://supriyashri290302_db_user:xxFTrlhFjaJhhsLA@skillswap.zwjd6e.mongodb.net/skillswap?retryWrites=true&w=majority',
  
  // Try without appName
  'mongodb+srv://supriyashri290302_db_user:xxFTrlhFjaJhhsLA@skillswap.zwjd6e.mongodb.net/skillswap?retryWrites=true&w=majority',
  
  // Standard format (if SRV doesn't work, we'll need the specific host)
  // 'mongodb://skillswap-shard-00-00.zwjd6e.mongodb.net:27017,skillswap-shard-00-01.zwjd6e.mongodb.net:27017,skillswap-shard-00-02.zwjd6e.mongodb.net:27017/skillswap?ssl=true&replicaSet=atlas-123456-shard-0&authSource=admin&retryWrites=true&w=majority'
];

async function testConnections() {
  console.log('🧪 Testing different connection methods...\n');
  
  for (let i = 0; i < connections.length; i++) {
    const uri = connections[i];
    console.log(`📡 Testing connection ${i + 1}...`);
    
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      
      console.log(`✅ Connection ${i + 1} successful!`);
      
      // Test a simple operation
      const testDoc = { test: `Connection ${i + 1}`, timestamp: new Date() };
      const result = await mongoose.connection.db.collection('test').insertOne(testDoc);
      console.log(`✅ Test document inserted with ID: ${result.insertedId}`);
      
      await mongoose.disconnect();
      console.log('🎉 This connection string works!\n');
      
      console.log('✅ WORKING CONNECTION STRING:');
      console.log(uri);
      return uri;
      
    } catch (error) {
      console.log(`❌ Connection ${i + 1} failed: ${error.message}`);
      
      try {
        await mongoose.disconnect();
      } catch (e) {
        // Ignore disconnect errors
      }
    }
    
    console.log('---');
  }
  
  console.log('\n🔴 All connection attempts failed.');
  console.log('\n💡 This usually means:');
  console.log('   1. Atlas cluster is still being created (wait 5-10 minutes)');
  console.log('   2. Network access not configured (check Atlas Network Access settings)');
  console.log('   3. Database user credentials are incorrect');
  console.log('\n📋 Please check your Atlas dashboard:');
  console.log('   - Cluster status should be "Available"');
  console.log('   - Network Access should include your IP or 0.0.0.0/0');
  console.log('   - Database user should be created with correct permissions');
}

testConnections();
