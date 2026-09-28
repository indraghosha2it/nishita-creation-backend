// D:\power-bank\power-bank-backend\test-fraud.js
const dotenv = require('dotenv');

// Load .env from the current directory
dotenv.config();

// Debug: Check if credentials are loaded
console.log('📋 Environment check:');
console.log('  PATHAO_COURIER_USERNAME:', process.env.PATHAO_COURIER_USERNAME ? '✅ ' + process.env.PATHAO_COURIER_USERNAME : '❌ Missing');
console.log('  PATHAO_COURIER_CLIENT_ID:', process.env.PATHAO_COURIER_CLIENT_ID ? '✅ Set' : '❌ Missing');
console.log('  PATHAO_COURIER_CLIENT_SECRET:', process.env.PATHAO_COURIER_CLIENT_SECRET ? '✅ Set' : '❌ Missing');
console.log('  STEADFAST_COURIER_API_KEY:', process.env.STEADFAST_COURIER_API_KEY ? '✅ Set' : '❌ Missing');

const { FraudCheckService } = require('@webdevarif/couriers');

async function testFraudCheck() {
  console.log('\n🔧 Testing FraudCheckService with your credentials...');
  
  try {
    const fraudService = new FraudCheckService();
    
    // Test with a phone number
    const phone = '01712513331';
    console.log(`\n🔍 Checking fraud for: ${phone}`);
    const result = await fraudService.checkFraud({ phone: phone });
    console.log('📥 Response:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testFraudCheck();