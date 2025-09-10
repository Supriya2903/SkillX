const mongoose = require('mongoose');

const ATLAS_URI = 'mongodb+srv://supriyashri290302_db_user:xxFTrlhFjaJhhsLA@skillswap.zwjd6e.mongodb.net/skillswap?retryWrites=true&w=majority&appName=SkillSwap';

async function testAtlasConnection() {
  console.log('🧪 Testing Atlas connection...');
  
  try {
    console.log('🌐 Connecting to MongoDB Atlas...');
    await mongoose.connect(ATLAS_URI, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout
    });
    console.log('✅ Successfully connected to Atlas!');
    
    // Test basic operation
    const testCollection = mongoose.connection.db.collection('test');
    await testCollection.insertOne({ test: 'Hello Atlas!', timestamp: new Date() });
    console.log('✅ Test document inserted successfully!');
    
    const testDoc = await testCollection.findOne({ test: 'Hello Atlas!' });
    console.log('✅ Test document retrieved:', testDoc);
    
    // Clean up
    await testCollection.deleteOne({ test: 'Hello Atlas!' });
    console.log('✅ Cleanup completed');
    
    await mongoose.disconnect();
    console.log('🎉 Atlas connection test successful!');
    
  } catch (error) {
    console.error('❌ Atlas connection failed:', error.message);
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('\n💡 DNS resolution failed. This could be:');
      console.log('   1. Network connectivity issue');
      console.log('   2. Firewall blocking the connection');
      console.log('   3. Atlas cluster not fully initialized yet');
      console.log('\n🔄 Try again in a few minutes, or check your Atlas cluster status.');
    }
  }
}

testAtlasConnection();
