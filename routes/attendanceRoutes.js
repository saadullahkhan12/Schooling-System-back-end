const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// Mark attendance (Admin/Teacher only)
router.post('/mark', authMiddleware(['admin']), async (req, res) => {
  try {
    const { studentId, date, status, subject, remarks } = req.body;

    const attendance = new Attendance({
      student: studentId,
      date: date || new Date(),
      status,
      subject,
      remarks,
      markedBy: req.user.id
    });

    await attendance.save();
    
    // Populate student details in response
    await attendance.populate('student', 'username email');
    
    res.status(201).json({
      message: 'Attendance marked successfully',
      attendance
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Attendance already marked for this student' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Mark multiple students attendance
router.post('/mark-multiple', authMiddleware(['admin']), async (req, res) => {
  try {
    const { attendances } = req.body;
    const results = [];

    for (const att of attendances) {
      try {
        const attendance = new Attendance({
          student: att.studentId,
          date: att.date || new Date(),
          status: att.status,
          subject: att.subject,
          remarks: att.remarks,
          markedBy: req.user.id
        });

        await attendance.save();
        await attendance.populate('student', 'username email');
        results.push({ success: true, attendance });
      } catch (error) {
        results.push({ 
          success: false, 
          error: error.message,
          studentId: att.studentId 
        });
      }
    }

    res.json({
      message: 'Batch attendance processed',
      results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get attendance for a student
router.get('/student/:studentId', authMiddleware(['student', 'admin']), async (req, res) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate, subject } = req.query;

    // Check if user is accessing their own data or is admin
    if (req.user.role === 'student' && req.user.id !== studentId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const filter = { student: studentId };
    
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (subject) {
      filter.subject = subject;
    }

    const attendance = await Attendance.find(filter)
      .populate('markedBy', 'username')
      .sort({ date: -1 });

    res.json({ attendance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get attendance report for class (Admin only)
router.get('/report', authMiddleware(['admin']), async (req, res) => {
  try {
    const { startDate, endDate, subject } = req.query;

    const filter = {};
    
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (subject) {
      filter.subject = subject;
    }

    const report = await Attendance.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$student',
          totalDays: { $sum: 1 },
          present: {
            $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
          },
          absent: {
            $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] }
          },
          late: {
            $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $project: {
          'student.password': 0,
          'student.resetPasswordToken': 0,
          'student.resetPasswordExpires': 0
        }
      }
    ]);

    res.json({ report });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update attendance
router.put('/:id', authMiddleware(['admin']), async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('student', 'username email');

    res.json({
      message: 'Attendance updated successfully',
      attendance
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete attendance
router.delete('/:id', authMiddleware(['admin']), async (req, res) => {
  try {
    await Attendance.findByIdAndDelete(req.params.id);
    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;