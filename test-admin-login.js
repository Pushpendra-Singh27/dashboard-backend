/**
 * Test script for Admin Login API
 * This script demonstrates how to test the admin login functionality
 */

console.log('🔐 Admin Login API Test Guide');
console.log('=' .repeat(50));

console.log('\n📋 Admin Credentials (Auto-created on server start):');
console.log('Username: admin');
console.log('Password: Shashwatha@123');

console.log('\n🚀 API Endpoints:');
console.log('1. POST /api/admin/login - Admin authentication');
console.log('2. POST /api/admin/logout - Admin logout');
console.log('3. GET /api/admin/profile - Get admin profile');

console.log('\n📝 Test the Admin Login API:');

const loginData = {
  userId: 'admin',
  password: 'Shashwatha@123'
};

console.log('\n1. Admin Login:');
console.log(`curl -X POST http://localhost:5000/api/admin/login \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(loginData)}'`);

console.log('\n📊 Expected Login Response:');
console.log(`{
  "success": true,
  "message": "Admin login successful",
  "data": {
    "admin": {
      "userId": "admin",
      "lastLogin": "2024-01-01T00:00:00.000Z",
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  }
}`);

console.log('\n2. Get Admin Profile (use token from login):');
console.log(`curl -X GET http://localhost:5000/api/admin/profile \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"`);

console.log('\n3. Admin Logout:');
console.log(`curl -X POST http://localhost:5000/api/admin/logout \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"`);

console.log('\n❌ Invalid Login Test:');
const invalidLoginData = {
  userId: 'admin',
  password: 'wrongpassword'
};

console.log(`curl -X POST http://localhost:5000/api/admin/login \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(invalidLoginData)}'`);

console.log('\n📊 Expected Error Response:');
console.log(`{
  "success": false,
  "message": "Invalid credentials"
}`);

console.log('\n✅ Admin Login API is ready for testing!');
console.log('🔑 The admin credentials are automatically created when the server starts.');
console.log('💡 Use the JWT token from login response for authenticated requests.');

module.exports = {};
