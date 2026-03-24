const { prisma } = require('../config/database');

exports.logSession = async (req, res) => {
  try {
    const { action_type, subject_code, subject_name } = req.body;
    await prisma.session.create({
      data: {
        user_id: req.user.userId,
        action_type,
        subject_code,
        subject_name
      }
    });
    res.status(201).json({ message: 'Session logged' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
