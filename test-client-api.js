const mongoose = require('mongoose');
const Client = require('./models/Client');
const Project = require('./models/Project');
require('dotenv').config();

/**
 * Test script to create sample data and demonstrate the client API functionality
 */

async function createSampleData() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGOURL);
    console.log('✅ Connected to database');

    // Clear existing test data (optional)
    console.log('🧹 Clearing existing test data...');
    await Client.deleteMany({ email: { $regex: /test.*@example\.com/ } });
    await Project.deleteMany({ name: { $regex: /Test Project/ } });

    // Create sample clients
    console.log('👤 Creating sample clients...');
    
    const client1 = new Client({
      name: 'Test Client 1',
      email: 'testclient1@example.com',
      password: 'password123'
    });
    await client1.save();
    console.log(`✅ Created client: ${client1.clientId} - ${client1.name}`);

    const client2 = new Client({
      name: 'Test Client 2',
      email: 'testclient2@example.com',
      password: 'password123'
    });
    await client2.save();
    console.log(`✅ Created client: ${client2.clientId} - ${client2.name}`);

    // Create sample projects
    console.log('📁 Creating sample projects...');
    
    const project1 = new Project({
      name: 'Test Project 1 - Website Development',
      assignedTo: client1._id,
      description: 'A comprehensive website development project with modern UI/UX design',
      expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      renewalCost: 5000
    });
    await project1.save();
    console.log(`✅ Created project: ${project1.projectId} - ${project1.name}`);

    const project2 = new Project({
      name: 'Test Project 2 - Mobile App',
      assignedTo: client1._id,
      description: 'Cross-platform mobile application development using React Native',
      expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      renewalCost: 8000
    });
    await project2.save();
    console.log(`✅ Created project: ${project2.projectId} - ${project2.name}`);

    const project3 = new Project({
      name: 'Test Project 3 - E-commerce Platform',
      assignedTo: client2._id,
      description: 'Full-featured e-commerce platform with payment integration',
      expiryDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120 days from now
      renewalCost: 12000
    });
    await project3.save();
    console.log(`✅ Created project: ${project3.projectId} - ${project3.name}`);

    // Update client projects array
    client1.projects.push(project1._id, project2._id);
    await client1.save();
    
    client2.projects.push(project3._id);
    await client2.save();

    console.log('\n🎉 Sample data created successfully!');
    console.log('\n📋 Test the following API endpoints:');
    console.log(`GET http://localhost:3000/api/client/${client1.clientId}/projects`);
    console.log(`GET http://localhost:3000/api/client/${client1.clientId}/profile`);
    console.log(`GET http://localhost:3000/api/client/${client1.clientId}/projects/${project1.projectId}`);
    console.log(`GET http://localhost:3000/api/client/${client2.clientId}/projects`);
    console.log(`GET http://localhost:3000/api/client/${client2.clientId}/profile`);

    console.log('\n📊 Sample Data Summary:');
    console.log(`Client 1: ${client1.clientId} (${client1.name}) - ${client1.projects.length} projects`);
    console.log(`Client 2: ${client2.clientId} (${client2.name}) - ${client2.projects.length} projects`);
    console.log(`Total Projects Created: 3`);

  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
if (require.main === module) {
  createSampleData();
}

module.exports = { createSampleData };
