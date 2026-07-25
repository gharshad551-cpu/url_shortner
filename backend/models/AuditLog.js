const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true
  },
  userEmail: {
    type: String
  },
  status: {
    type: String,
    enum: ['success', 'failure'],
    required: true
  },
  ipAddress: {
    type: String
  },
  details: {
    type: String
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    expires: 30 * 24 * 60 * 60, // Auto-delete logs after 30 days
    index: -1
  }
});

module.exports = mongoose.model("AuditLog", auditLogSchema);
