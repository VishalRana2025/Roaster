const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  employeeName: { type: String, required: true },
  date: { type: Date, required: true },
  clockIn: { type: String, required: true },
  clockOut: { type: String },
  status: { type: String, enum: ['Present', 'Late', 'Absent'], default: 'Present' },
  workingHours: { type: String },
  markedBy: { type: String, enum: ['Self', 'Admin'], default: 'Self' }
}, { timestamps: true });

// Ensure one attendance per employee per day
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);