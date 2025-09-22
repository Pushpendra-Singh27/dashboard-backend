const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [200, 'Project name cannot be more than 200 characters']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Project must be assigned to a client']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Expiry date must be in the future'
    }
  },
  renewalCost: {
    type: Number,
    required: [true, 'Renewal cost is required'],
    min: [0, 'Renewal cost cannot be negative']
  },
  projectId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'renewed', 'cancelled'],
    default: 'active'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  renewalHistory: [{
    renewedDate: {
      type: Date,
      default: Date.now
    },
    previousExpiryDate: Date,
    newExpiryDate: Date,
    renewalCost: Number,
    notes: String
  }]
}, {
  timestamps: true
});

// Index for better query performance
projectSchema.index({ assignedTo: 1 });
projectSchema.index({ projectId: 1 });
projectSchema.index({ expiryDate: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ createdAt: -1 });

// Generate unique project ID before saving
projectSchema.pre('save', async function(next) {
  // Generate project ID if it's a new project
  if (this.isNew && !this.projectId) {
    try {
      const count = await this.constructor.countDocuments();
      this.projectId = `PRJ${String(count + 1).padStart(4, '0')}`;
    } catch (error) {
      return next(error);
    }
  }

  // Update status based on expiry date
  if (this.expiryDate && this.expiryDate < new Date() && this.status === 'active') {
    this.status = 'expired';
  }

  next();
});

// Static method to find projects by client
projectSchema.statics.findByClient = function(clientId) {
  return this.find({ assignedTo: clientId }).populate('assignedTo', 'name email clientId');
};

// Static method to find expiring projects (within next 30 days)
projectSchema.statics.findExpiringProjects = function(days = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    expiryDate: { $lte: futureDate, $gte: new Date() },
    status: 'active'
  }).populate('assignedTo', 'name email clientId');
};

// Static method to find expired projects
projectSchema.statics.findExpiredProjects = function() {
  return this.find({
    expiryDate: { $lt: new Date() },
    status: { $in: ['active', 'expired'] }
  }).populate('assignedTo', 'name email clientId');
};

// Instance method to check if project is expired
projectSchema.methods.isExpired = function() {
  return this.expiryDate < new Date();
};

// Instance method to get days until expiry
projectSchema.methods.getDaysUntilExpiry = function() {
  const today = new Date();
  const expiry = new Date(this.expiryDate);
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Instance method to renew project
projectSchema.methods.renewProject = function(newExpiryDate, cost, notes = '') {
  // Add to renewal history
  this.renewalHistory.push({
    previousExpiryDate: this.expiryDate,
    newExpiryDate: newExpiryDate,
    renewalCost: cost,
    notes: notes
  });

  // Update project details
  this.expiryDate = newExpiryDate;
  this.renewalCost = cost;
  this.status = 'renewed';

  return this.save();
};

// Virtual to get project duration in days
projectSchema.virtual('durationInDays').get(function() {
  const start = new Date(this.startDate);
  const expiry = new Date(this.expiryDate);
  const diffTime = expiry - start;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Ensure virtual fields are serialized
projectSchema.set('toJSON', { virtuals: true });
projectSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Project', projectSchema);
