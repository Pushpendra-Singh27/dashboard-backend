const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  projectId: {
    type: String,
    required: true,
    unique: true
  },
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
    required: [true, 'Expiry date is required']
  },
  renewalCost: {
    type: Number,
    required: [true, 'Renewal cost is required'],
    min: [0, 'Renewal cost cannot be negative']
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'renewed', 'cancelled'],
    default: 'active'
  },
  serviceProvider: {
    type: String,
    required: false,
    trim: true,
    maxlength: [200, 'Service provider name cannot be more than 200 characters']
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  paymentId: {
    type: String,
    default: null
  },
  orderId: {
    type: String,
    default: null
  },
  renewalHistory: [{
    renewedDate: {
      type: Date,
      default: Date.now
    },
    paymentId: {
      type: String,
      required: false
    },
    orderId: {
      type: String,
      required: false
    },
    previousExpiryDate: {
      type: Date,
      required: false
    },
    newExpiryDate: {
      type: Date,
      required: false
    }
  }]
}, {
  timestamps: true
});

// Index for better query performance
projectSchema.index({ assignedTo: 1 });
projectSchema.index({ expiryDate: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Project', projectSchema);