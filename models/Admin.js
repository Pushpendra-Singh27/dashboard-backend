const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    default: 'admin'
  },
  password: {
    type: String,
    required: true,
    select: false // Don't include password in queries by default
  },
  lastLogin: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
adminSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
adminSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Static method to create default admin if doesn't exist
adminSchema.statics.createDefaultAdmin = async function() {
  try {
    const existingAdmin = await this.findOne({ userId: 'admin' });
    if (!existingAdmin) {
      const defaultAdmin = new this({
        userId: 'admin',
        password: 'Shashwatha@123'
      });
      await defaultAdmin.save();
      console.log('✅ Default admin created successfully');
    }
  } catch (error) {
    console.error('❌ Error creating default admin:', error);
  }
};

// Static method to find admin by userId
adminSchema.statics.findByUserId = function(userId) {
  return this.findOne({ userId: userId });
};

module.exports = mongoose.model('Admin', adminSchema);
