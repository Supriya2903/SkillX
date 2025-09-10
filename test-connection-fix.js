const mongoose = require('mongoose');
const dns = require('dns');

// Try to resolve the DNS first
async function testDNSResolution() {
  console.log('🔍 Testing DNS resolution...');
  
  try {
    const records = await dns.promises.resolveSrv('_mongodb._tcp.skillswap.zwjd6e.mongodb.net');
    console.log('✅ DNS SRV records found:', records.length);
    return true;
  } catch (error) {
    console.log('❌ DNS SRV resolution failed:', error.message);
    
    // Try basic A record resolution
    try {
      const addresses = await dns.promises.resolve4('skillswap.zwjd6e.mongodb.net');
      console.log('✅ Basic DNS resolution works:', addresses.length, 'addresses');
      return false; // SRV failed but basic DNS works
    } catch (basicError) {
      console.log('❌ Basic DNS resolution also failed:', basicError.message);
      return false;
    }
  }
}

// Test connection with different options
async function testConnectionOptions() {
  console.log('🧪 Testing Atlas connection with different options...\n');
  
  const dnsWorking = await testDNSResolution();
  
  if (!dnsWorking) {
    console.log('\n💡 DNS issues detected. This could be:');
    console.log('   1. Your ISP blocking MongoDB Atlas');
    console.log('   2. Corporate firewall restrictions');
    console.log('   3. Network configuration issues');
    console.log('\n🔄 Let\'s try some workarounds...\n');
  }
  
  // Different connection string variations to try
  const connectionStrings = [
    // Original with different options
    {
      uri: 'mongodb+srv://supriyashri290302_db_user:xxFTrlhFjaJhhsLA@skillswap.zwjd6e.mongodb.net/skillswap?retryWrites=true&w=majority',
      options: { 
        serverSelectionTimeoutMS: 20000,
        socketTimeoutMS: 60000,
        family: 4, // Force IPv4
        bufferMaxEntries: 0,
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    },
    // Try without database name
    {
      uri: 'mongodb+srv://supriyashri290302_db_user:xxFTrlhFjaJhhsLA@skillswap.zwjd6e.mongodb.net/?retryWrites=true&w=majority',
      options: { 
        serverSelectionTimeoutMS: 15000,
        family: 4
      }
    },
    // Try with different timeout
    {
      uri: 'mongodb+srv://supriyashri290302_db_user:xxFTrlhFjaJhhsLA@skillswap.zwjd6e.mongodb.net/skillswap?retryWrites=true&w=majority&serverSelectionTimeoutMS=30000',
      options: { 
        bufferMaxEntries: 0
      }
    }
  ];
  
  for (let i = 0; i < connectionStrings.length; i++) {
    const { uri, options } = connectionStrings[i];
    console.log(`🔗 Trying connection method ${i + 1}...`);
    
    try {
      const connection = await mongoose.createConnection(uri, options);
      console.log(`✅ Connection ${i + 1} successful!`);
      
      // Test database operation
      const testCollection = connection.db.collection('connection_test');
      const result = await testCollection.insertOne({ 
        test: 'Connection successful', 
        timestamp: new Date(),
        method: i + 1
      });
      
      console.log(`✅ Database operation successful! Document ID: ${result.insertedId}`);
      
      // Clean up
      await testCollection.deleteOne({ _id: result.insertedId });
      await connection.close();
      
      console.log('🎉 This connection method works!');
      console.log(`📝 Working URI: ${uri}`);
      return uri;
      
    } catch (error) {
      console.log(`❌ Connection ${i + 1} failed:`, error.message);
    }
    
    console.log('---');
  }
  
  console.log('\n🔴 All connection methods failed.');
  console.log('\n💡 Next steps:');
  console.log('   1. Add 0.0.0.0/0 to Network Access (if not done)');
  console.log('   2. Try from a different network (mobile hotspot)');
  console.log('   3. Contact your network administrator');
  console.log('   4. Deploy to Vercel (it will likely work from their servers)');
}

testConnectionOptions();
