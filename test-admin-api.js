const mongoose = require('mongoose');
const Client = require('./models/Client');
const Project = require('./models/Project');
require('dotenv').config();

/**
 * Test script to demonstrate the admin API functionality
 */

async function testAdminAPIs() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGOURL);
    console.log('✅ Connected to database');

    // Clear existing test data (optional)
    console.log('🧹 Clearing existing admin test data...');
    await Client.deleteMany({ email: { $regex: /admin.*test.*@example\.com/ } });
    await Project.deleteMany({ name: { $regex: /Admin Test Project/ } });

    console.log('\n🎯 Admin API Test Scenarios');
    console.log('=' .repeat(50));

    // Test data for API calls
    const testClient1 = {
      name: 'Admin Test Client 1',
      email: 'admin.test.client1@example.com',
      password: 'testpassword123'
    };

    const testClient2 = {
      name: 'Admin Test Client 2',
      email: 'admin.test.client2@example.com',
      password: 'testpassword456'
    };

    const testProject1 = {
      name: 'Admin Test Project 1 - E-commerce',
      description: 'Full-stack e-commerce platform with payment integration',
      expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days from now
      renewalCost: 15000,
      projectId: 'ADMIN001' // Custom project ID
    };

    const testProject2 = {
      name: 'Admin Test Project 2 - Mobile App',
      description: 'Cross-platform mobile application with real-time features',
      expiryDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120 days from now
      renewalCost: 12000
      // No custom projectId - will be auto-generated
    };

    console.log('\n📋 Test API Endpoints:');
    console.log('1. POST /api/admin/clients - Add new client');
    console.log('2. PUT /api/admin/clients/:clientId/generate-id - Generate unique client ID');
    console.log('3. POST /api/admin/clients/:clientId/projects - Add project to client');
    console.log('4. GET /api/admin/clients - Get all clients');
    console.log('5. GET /api/admin/projects - Get all projects');

    console.log('\n🔧 Sample Request Bodies:');
    console.log('\n1. Add New Client (POST /api/admin/clients):');
    console.log(JSON.stringify(testClient1, null, 2));

    console.log('\n2. Generate Unique Client ID (PUT /api/admin/clients/CLI0001/generate-id):');
    console.log('No request body required');

    console.log('\n3. Add Project to Client (POST /api/admin/clients/CLI0001/projects):');
    console.log(JSON.stringify(testProject1, null, 2));

    console.log('\n📊 Expected Response Format:');
    console.log(`
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  }
}
    `);

    console.log('\n🚀 To test these APIs:');
    console.log('1. Start the server: npm run dev');
    console.log('2. Use Postman, curl, or any HTTP client');
    console.log('3. Base URL: http://localhost:3000');

    console.log('\n📝 Sample cURL Commands:');
    console.log(`
# 1. Add new client
curl -X POST http://localhost:3000/api/admin/clients \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(testClient1)}'

# 2. Get all clients
curl -X GET http://localhost:3000/api/admin/clients

# 3. Add project to client (replace CLI0001 with actual client ID)
curl -X POST http://localhost:3000/api/admin/clients/CLI0001/projects \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(testProject1)}'

# 4. Generate new client ID (replace CLI0001 with actual client ID)
curl -X PUT http://localhost:3000/api/admin/clients/CLI0001/generate-id

# 5. Get all projects
curl -X GET http://localhost:3000/api/admin/projects
    `);

    console.log('\n✅ Admin API test script completed!');
    console.log('📌 All endpoints are ready for testing');

  } catch (error) {
    console.error('❌ Error in admin API test:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
if (require.main === module) {
  testAdminAPIs();
}

module.exports = { testAdminAPIs };
