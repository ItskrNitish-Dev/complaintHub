const { Counter } = require('../models');

/**
 * Generate sequential human-readable complaint identifier: CH-YYYY-000001
 */
const generateComplaintNumber = async () => {
  const currentYear = new Date().getFullYear();
  const counterName = `complaintNumber_${currentYear}`;

  const counter = await Counter.findOneAndUpdate(
    { name: counterName },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const paddedSeq = String(counter.seq).padStart(6, '0');
  return `CH-${currentYear}-${paddedSeq}`;
};

module.exports = {
  generateComplaintNumber,
};
