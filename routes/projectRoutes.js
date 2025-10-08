const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Project = require('../models/Project');
const { protect } = require('../middlewares/authMiddleware');

// Renew Project after Payment
router.post('/renew/:projectId', protect, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { paymentId, orderId, signature, newExpiryDate } = req.body;

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

    // Find and update project
    const project = await Project.findOne({ projectId });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Calculate new expiry date (1 year from current expiry or current date)
    const currentDate = new Date();
    const currentExpiry = new Date(project.expiryDate);
    let calculatedExpiryDate;

    if (newExpiryDate) {
      calculatedExpiryDate = new Date(newExpiryDate);
    } else {
      // If current expiry is in future, extend from that date, otherwise from current date
      const baseDate = currentExpiry > currentDate ? currentExpiry : currentDate;
      calculatedExpiryDate = new Date(baseDate);
      calculatedExpiryDate.setFullYear(calculatedExpiryDate.getFullYear() + 1);
    }

    // Update project status and renewal information
    project.status = 'renewed';
    project.expiryDate = calculatedExpiryDate;
    project.paymentId = paymentId;
    project.orderId = orderId;
    
    // Add to renewal history
    project.renewalHistory.push({
      renewedDate: new Date(),
      paymentId: paymentId,
      orderId: orderId,
      previousExpiryDate: currentExpiry,
      newExpiryDate: calculatedExpiryDate
    });
    
    await project.save();

    res.json({
      success: true,
      message: 'Project renewed successfully',
      data: {
        projectId: project.projectId,
        name: project.name,
        status: project.status,
        expiryDate: project.expiryDate,
        paymentId: project.paymentId,
        orderId: project.orderId
      }
    });

  } catch (error) {
    console.error('Error renewing project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to renew project',
      error: error.message
    });
  }
});

// Get Project Renewal History
router.get('/renewal-history/:projectId', protect, async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findOne({ projectId }).select('projectId name renewalHistory');
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      message: 'Renewal history fetched successfully',
      data: {
        projectId: project.projectId,
        name: project.name,
        renewalHistory: project.renewalHistory
      }
    });

  } catch (error) {
    console.error('Error fetching renewal history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch renewal history',
      error: error.message
    });
  }
});

// Update Project Status to Active (after successful renewal)
router.patch('/activate/:projectId', protect, async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findOneAndUpdate(
      { projectId },
      { status: 'active' },
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      message: 'Project activated successfully',
      data: {
        projectId: project.projectId,
        name: project.name,
        status: project.status
      }
    });

  } catch (error) {
    console.error('Error activating project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to activate project',
      error: error.message
    });
  }
});

module.exports = router;
