const express = require('express');
const router = express.Router();
const razorpay = require('../config/razorpay');
const crypto = require('crypto');
const Project = require('../models/Project');
const { protect } = require('../middlewares/authMiddleware');

// Create Razorpay Order
router.post('/create-order', protect, async (req, res) => {
  try {
    const { projectId, amount, currency = 'INR' } = req.body;

    // Validate required fields
    if (!projectId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Project ID and amount are required'
      });
    }

    // Validate project exists
    const project = await Project.findOne({ projectId });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Create Razorpay order
    const options = {
      amount: amount, // amount in paise
      currency: currency,
      receipt: `receipt_${projectId}_${Date.now()}`,
      notes: {
        projectId: projectId,
        projectName: project.name
      }
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      key: 'rzp_live_RQzjvDiL3BcGtX' // Send key for frontend
    });

  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message
    });
  }
});

// Verify Payment
router.post('/verify-payment', protect, async (req, res) => {
  try {
    const { paymentId, orderId, signature } = req.body;

    // Validate required fields
    if (!paymentId || !orderId || !signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID, Order ID, and signature are required'
      });
    }

    // Verify Razorpay signature
    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', 'Z4hvxLqKzHWvNhic1Lwo7lF9') // Your secret key
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        paymentId,
        orderId,
        verified: true
      }
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message
    });
  }
});

module.exports = router;
