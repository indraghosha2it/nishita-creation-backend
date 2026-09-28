// D:\power-bank\power-bank-backend\test-redx-creds.js
const dotenv = require('dotenv');
dotenv.config();

async function testRedXCredentials() {
  console.log('🧪 Testing RedX Credentials...\n');
  
  const token = process.env.REDX_COURIER_API_TOKEN;
  const phone = process.env.REDX_COURIER_PHONE;
  const password = process.env.REDX_COURIER_PASSWORD;
  
  console.log('📋 Credentials found:');
  console.log('  API Token:', token ? '✅' : '❌');
  console.log('  Phone:', phone ? '✅' : '❌');
  console.log('  Password:', password ? '✅' : '❌');
  
  // Test 1: API Token
  if (token) {
    console.log('\n🔑 Testing API Token...');
    try {
      const response = await fetch(
        'https://redx.com.bd/api/redx_se/admin/parcel/customer-success-return-rate?phoneNumber=01712513331',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      );
      
      const text = await response.text();
      console.log('  Status:', response.status);
      
      if (response.ok) {
        console.log('  ✅ Token works for stats!');
      } else if (text.includes('Invalid Token')) {
        console.log('  ❌ Token is invalid for stats endpoint');
        console.log('  💡 Trying phone/password instead...');
      } else {
        console.log('  ⚠️ Token error:', text.substring(0, 100));
      }
    } catch (error) {
      console.log('  ❌ Error:', error.message);
    }
  }
  
  // Test 2: Phone + Password
  if (phone && password) {
    console.log('\n📱 Testing Phone + Password...');
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const formattedPhone = cleanPhone.startsWith('880') ? cleanPhone : `88${cleanPhone.replace(/^0/, '')}`;
      
      const response = await fetch('https://api.redx.com.bd/v4/auth/login', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formattedPhone,
          password: password,
        }),
      });
      
      const data = await response.json();
      console.log('  Status:', response.status);
      
      if (response.ok) {
        const newToken = data?.data?.accessToken;
        console.log('  ✅ Login successful!');
        console.log('  🔑 New token obtained:', newToken ? newToken.substring(0, 20) + '...' : 'No token');
        
        // Test the new token
        if (newToken) {
          console.log('\n  🔍 Testing new token for stats...');
          const statsRes = await fetch(
            'https://redx.com.bd/api/redx_se/admin/parcel/customer-success-return-rate?phoneNumber=01712513331',
            {
              headers: {
                'Authorization': `Bearer ${newToken}`,
                'Accept': 'application/json',
              },
            }
          );
          console.log('  Stats endpoint status:', statsRes.status);
          if (statsRes.ok) {
            console.log('  ✅ New token works for stats!');
            console.log('\n  💡 Add this to your .env:');
            console.log(`  REDX_COURIER_API_TOKEN=${newToken}`);
          } else {
            const text = await statsRes.text();
            console.log('  ❌ Stats endpoint error:', text.substring(0, 100));
          }
        }
      } else {
        console.log('  ❌ Login failed:', data?.message || 'Unknown error');
      }
    } catch (error) {
      console.log('  ❌ Error:', error.message);
    }
  }
  
  if (!token && !phone) {
    console.log('\n❌ No RedX credentials found in .env');
    console.log('Please add:');
    console.log('  REDX_COURIER_API_TOKEN=your_token');
    console.log('  OR');
    console.log('  REDX_COURIER_PHONE=your_phone');
    console.log('  REDX_COURIER_PASSWORD=your_password');
  }
}

testRedXCredentials();