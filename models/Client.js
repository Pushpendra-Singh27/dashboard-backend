const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  clientId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  projects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for better query performance
clientSchema.index({ email: 1 });
clientSchema.index({ clientId: 1 });
clientSchema.index({ createdAt: -1 });

// Generate unique client ID before saving
clientSchema.pre('save', async function(next) {
  // Generate client ID if it's a new client
  if (this.isNew && !this.clientId) {
    try {
      const count = await this.constructor.countDocuments();
      this.clientId = `CLI${String(count + 1).padStart(4, '0')}`;
    } catch (error) {
      return next(error);
    }
  }

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
clientSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Instance method to get public profile (without password)
clientSchema.methods.getPublicProfile = function() {
  const clientObject = this.toObject();
  delete clientObject.password;
  return clientObject;
};

// Static method to find client by email
clientSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find client by client ID
clientSchema.statics.findByClientId = function(clientId) {
  return this.findOne({ clientId: clientId.toUpperCase() });
};

// Virtual to get project count
clientSchema.virtual('projectCount').get(function() {
  return this.projects ? this.projects.length : 0;
});

// Ensure virtual fields are serialized
clientSchema.set('toJSON', { virtuals: true });
clientSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Client', clientSchema);
