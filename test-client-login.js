/**
 * Test script for Client Login API
 * This script demonstrates how to test the client login functionality
 */

console.log('🔐 Client Login API Test Guide');
console.log('=' .repeat(50));

console.log('\n📋 Client Login Options:');
console.log('1. Login with Client ID + Password');
console.log('2. Login with Email + Password');

console.log('\n🚀 API Endpoints:');
console.log('1. POST /api/client/login - Client authentication');
console.log('2. POST /api/client/logout - Client logout');

console.log('\n📝 Test the Client Login API:');

// Sample test data (you'll need to create clients first using admin API)
const loginWithClientId = {
  identifier: 'CLI0001',  // Client ID
  password: 'password123'
};

const loginWithEmail = {
  identifier: 'testclient1@example.com',  // Email
  password: 'password123'
};

console.log('\n1. Client Login with Client ID:');
console.log(`curl -X POST http://localhost:5000/api/client/login \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(loginWithClientId)}'`);

console.log('\n2. Client Login with Email:');
console.log(`curl -X POST http://localhost:5000/api/client/login \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(loginWithEmail)}'`);

console.log('\n📊 Expected Login Response:');
console.log(`{
  "success": true,
  "message": "Client login successful",
  "data": {
    "client": {
      "clientId": "CLI0001",
      "name": "Test Client 1",
      "email": "testclient1@example.com",
      "lastLogin": "2024-01-01T00:00:00.000Z",
      "isActive": true,
      "projectCount": 2
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  }
}`);

console.log('\n3. Client Logout:');
console.log(`curl -X POST http://localhost:5000/api/client/logout \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"`);

console.log('\n❌ Invalid Login Tests:');

const invalidClientId = {
  identifier: 'CLI9999',  // Non-existent client ID
  password: 'password123'
};

const invalidPassword = {
  identifier: 'CLI0001',
  password: 'wrongpassword'
};

console.log('\n4. Invalid Client ID:');
console.log(`curl -X POST http://localhost:5000/api/client/login \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(invalidClientId)}'`);

console.log('\n5. Invalid Password:');
console.log(`curl -X POST http://localhost:5000/api/client/login \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(invalidPassword)}'`);

console.log('\n📊 Expected Error Response:');
console.log(`{
  "success": false,
  "message": "Invalid credentials"
}`);

console.log('\n🔧 Prerequisites:');
console.log('1. Create clients first using Admin API:');
console.log(`   curl -X POST http://localhost:5000/api/admin/clients \\
     -H "Content-Type: application/json" \\
     -d '{"name":"Test Client","email":"test@example.com","password":"password123"}'`);

console.log('\n2. Note the returned clientId from the response');
console.log('3. Use either clientId or email for login');

console.log('\n✅ Client Login API Features:');
console.log('🔑 Flexible login: Client ID OR Email + Password');
console.log('🛡️ JWT token authentication (24h expiry)');
console.log('📊 Returns client info + project count');
console.log('🔒 Account status validation');
console.log('⏰ Last login tracking');

console.log('\n💡 Usage in Frontend:');
console.log('- Store the JWT token in localStorage/sessionStorage');
console.log('- Include token in Authorization header for protected routes');
console.log('- Use clientId from response for subsequent API calls');

module.exports = {};
