const bcrypt = require('bcryptjs');

async function testBcrypt() {
  try {
    console.log('Testing bcrypt...');
    const password = 'test123';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    console.log('Hash generated:', hash);
    
    const isMatch = await bcrypt.compare(password, hash);
    console.log('Password match:', isMatch);
    console.log('✅ bcrypt is working!');
  } catch (error) {
    console.error('❌ bcrypt error:', error);
  }
}

testBcrypt();