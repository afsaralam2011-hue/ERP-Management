const express = require('express');
const router = express.Router();

// GET all notifications
router.get('/', async (req, res) => {
  try {
    const notifications = [
      { 
        id: 1, 
        message: "Flattening section: نئی پروڈکشن انٹری 500 کلو", 
        time: "10 منٹ پہلے", 
        type: "production",
        section: "flattening",
        read: false,
        createdAt: new Date()
      }
    ];
    
    res.json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Notifications حاصل کرنے میں مسئلہ' 
    });
  }
});

// POST new notification
router.post('/', async (req, res) => {
  try {
    const { message, type, section } = req.body;
    
    if (!message || !type) {
      return res.status(400).json({ 
        success: false, 
        error: 'Message اور Type ضروری ہے' 
      });
    }
    
    const newNotification = {
      id: Date.now(),
      message,
      type,
      section: section || 'general',
      read: false,
      time: new Date().toLocaleTimeString(),
      createdAt: new Date()
    };
    
    res.json({ 
      success: true, 
      message: 'Notification محفوظ ہو گیا',
      notification: newNotification 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Notification بنانے میں مسئلہ' 
    });
  }
});

// Production entry notification
router.post('/production-entry', async (req, res) => {
  try {
    const { quantity, section } = req.body;
    
    if (!quantity || !section) {
      return res.status(400).json({ 
        success: false, 
        error: 'Quantity اور Section ضروری ہے' 
      });
    }
    
    const newNotification = {
      id: Date.now(),
      message: `🏭 ${section}: نئی پروڈکشن انٹری ${quantity} کلو`,
      type: 'production',
      section: section,
      read: false,
      time: new Date().toLocaleTimeString(),
      createdAt: new Date()
    };
    
    res.json({ 
      success: true, 
      message: 'پروڈکشن notification محفوظ ہو گیا',
      notification: newNotification 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'پروڈکشن notification بنانے میں مسئلہ' 
    });
  }
});

// Machine error notification
router.post('/machine-error', async (req, res) => {
  try {
    const { machine, error, section } = req.body;
    
    if (!machine || !error) {
      return res.status(400).json({ 
        success: false, 
        error: 'Machine اور Error ضروری ہے' 
      });
    }
    
    const newNotification = {
      id: Date.now(),
      message: `⚠️ ${section || ''} مشین ${machine}: ${error}`,
      type: 'error',
      section: section || 'maintenance',
      read: false,
      time: new Date().toLocaleTimeString(),
      createdAt: new Date()
    };
    
    res.json({ 
      success: true, 
      message: 'مشین خرابی notification محفوظ ہو گیا',
      notification: newNotification 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'مشین خرابی notification بنانے میں مسئلہ' 
    });
  }
});

// یہ لائن آخر میں ضرور ہو
module.exports = router;